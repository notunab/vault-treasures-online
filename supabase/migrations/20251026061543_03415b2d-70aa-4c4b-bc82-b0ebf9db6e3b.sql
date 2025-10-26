-- 1. Create addresses table
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  phone TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for addresses
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for addresses
CREATE POLICY "Users can view their own addresses"
  ON public.addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses"
  ON public.addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses"
  ON public.addresses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses"
  ON public.addresses FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Update bids table structure
ALTER TABLE public.bids 
  DROP COLUMN IF EXISTS bidder_name,
  ADD COLUMN IF NOT EXISTS bidder_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing bids to use user_id as bidder_id
UPDATE public.bids SET bidder_id = user_id WHERE bidder_id IS NULL;

-- 3. Add new fields to items table
ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS highest_bid NUMERIC,
  ADD COLUMN IF NOT EXISTS highest_bidder UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update existing items with current_bid as highest_bid
UPDATE public.items 
SET highest_bid = current_bid 
WHERE highest_bid IS NULL AND current_bid IS NOT NULL;

-- 4. Update orders table structure
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- Drop old shipping columns if they exist (we'll use address_id instead)
ALTER TABLE public.orders
  DROP COLUMN IF EXISTS shipping_address,
  DROP COLUMN IF EXISTS shipping_name,
  DROP COLUMN IF EXISTS shipping_city,
  DROP COLUMN IF EXISTS shipping_postal_code,
  DROP COLUMN IF EXISTS shipping_phone;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bids_item_id ON public.bids(item_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON public.bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON public.bids(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_auction_status ON public.items(auction_status);
CREATE INDEX IF NOT EXISTS idx_items_end_time ON public.items(end_time);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- 6. Create place_bid RPC function
CREATE OR REPLACE FUNCTION public.place_bid(
  p_item_id UUID,
  p_bidder_id UUID,
  p_amount NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item RECORD;
  v_min_bid NUMERIC;
BEGIN
  -- Lock the item row to prevent race conditions
  SELECT * INTO v_item
  FROM public.items
  WHERE id = p_item_id
  FOR UPDATE;

  -- Check if item exists
  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'error', 'Item not found');
  END IF;

  -- Check if auction is active
  IF v_item.auction_status != 'live' THEN
    RETURN json_build_object('ok', false, 'error', 'Auction is not active');
  END IF;

  -- Check if auction has ended
  IF v_item.end_time < NOW() THEN
    RETURN json_build_object('ok', false, 'error', 'Auction has ended');
  END IF;

  -- Calculate minimum bid
  v_min_bid := COALESCE(v_item.highest_bid, v_item.current_bid, v_item.price) + COALESCE(v_item.min_bid_increment, 50);

  -- Check if bid amount is valid
  IF p_amount < v_min_bid THEN
    RETURN json_build_object('ok', false, 'error', 'Bid amount must be at least ₹' || v_min_bid);
  END IF;

  -- Insert new bid
  INSERT INTO public.bids (item_id, user_id, bidder_id, amount)
  VALUES (p_item_id, p_bidder_id, p_bidder_id, p_amount);

  -- Update item with new highest bid
  UPDATE public.items
  SET 
    highest_bid = p_amount,
    highest_bidder = p_bidder_id,
    current_bid = p_amount
  WHERE id = p_item_id;

  -- Return success
  RETURN json_build_object('ok', true, 'new_high', p_amount);
END;
$$;

-- 7. Create function to close expired auctions
CREATE OR REPLACE FUNCTION public.close_expired_auctions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.items
  SET 
    auction_status = 'ended',
    winner_user_id = highest_bidder
  WHERE 
    auction_status = 'live'
    AND end_time < NOW()
    AND is_auction = true;
END;
$$;

-- 8. Update RLS policies for orders to include address_id
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 9. Grant execute permissions on RPC functions
GRANT EXECUTE ON FUNCTION public.place_bid TO authenticated;
GRANT EXECUTE ON FUNCTION public.close_expired_auctions TO authenticated;
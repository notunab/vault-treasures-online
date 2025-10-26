-- 1. Update bids table structure (only if bidder_name exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'bids' 
    AND column_name = 'bidder_name'
  ) THEN
    ALTER TABLE public.bids DROP COLUMN bidder_name;
  END IF;
END $$;

ALTER TABLE public.bids 
  ADD COLUMN IF NOT EXISTS bidder_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing bids to use user_id as bidder_id
UPDATE public.bids SET bidder_id = user_id WHERE bidder_id IS NULL;

-- 2. Add new fields to items table
ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS highest_bid NUMERIC,
  ADD COLUMN IF NOT EXISTS highest_bidder UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update existing items with current_bid as highest_bid
UPDATE public.items 
SET highest_bid = current_bid 
WHERE highest_bid IS NULL AND current_bid IS NOT NULL;

-- 3. Update orders table structure
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bids_item_id ON public.bids(item_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON public.bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON public.bids(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_auction_status ON public.items(auction_status);
CREATE INDEX IF NOT EXISTS idx_items_end_time ON public.items(end_time);
CREATE INDEX IF NOT EXISTS idx_items_highest_bidder ON public.items(highest_bidder);
CREATE INDEX IF NOT EXISTS idx_orders_address_id ON public.orders(address_id);

-- 5. Create place_bid RPC function with proper race condition handling
CREATE OR REPLACE FUNCTION public.place_bid(
  p_item_id UUID,
  p_bidder_id UUID,
  p_amount NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 6. Create function to close expired auctions
CREATE OR REPLACE FUNCTION public.close_expired_auctions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 7. Grant execute permissions on RPC functions
GRANT EXECUTE ON FUNCTION public.place_bid TO authenticated;
GRANT EXECUTE ON FUNCTION public.close_expired_auctions TO authenticated;
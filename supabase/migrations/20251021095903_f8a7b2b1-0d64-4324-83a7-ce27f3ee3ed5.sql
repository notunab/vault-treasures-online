-- Add auction-specific fields to items table
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS min_bid_increment numeric DEFAULT 50,
ADD COLUMN IF NOT EXISTS winner_user_id uuid,
ADD COLUMN IF NOT EXISTS auction_status text DEFAULT 'draft' CHECK (auction_status IN ('draft', 'upcoming', 'live', 'ended', 'sold'));

-- Add bidder name to bids for display purposes
ALTER TABLE public.bids
ADD COLUMN IF NOT EXISTS bidder_name text;

-- Create index for faster bid queries
CREATE INDEX IF NOT EXISTS idx_bids_item_id_amount ON public.bids(item_id, amount DESC);

-- Add policy for users to see all bids on live auctions
CREATE POLICY "Anyone can view bids on live auctions"
ON public.bids
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.items
    WHERE items.id = bids.item_id
    AND items.auction_status = 'live'
  )
);

-- Add policy for viewing auction items by status
CREATE POLICY "Anyone can view live and upcoming auctions"
ON public.items
FOR SELECT
USING (auction_status IN ('live', 'upcoming') OR verified = true);
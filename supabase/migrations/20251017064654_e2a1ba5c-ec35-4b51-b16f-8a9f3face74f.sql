-- First, check if order_status enum exists and update it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
  ELSE
    -- Add new values if they don't exist
    ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'processing';
    ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'shipped';
    ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'delivered';
    ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'cancelled';
  END IF;
END $$;

-- Add shipping and payment info to orders table
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS shipping_name TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address TEXT,
  ADD COLUMN IF NOT EXISTS shipping_city TEXT,
  ADD COLUMN IF NOT EXISTS shipping_postal_code TEXT,
  ADD COLUMN IF NOT EXISTS shipping_phone TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod',
  ADD COLUMN IF NOT EXISTS order_status order_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0;

-- Create order_items junction table for cart-based orders
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_purchase NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for order_items
CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );
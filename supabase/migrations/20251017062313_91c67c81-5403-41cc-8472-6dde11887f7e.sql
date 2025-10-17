-- Add new categories to the item_category enum
ALTER TYPE item_category ADD VALUE IF NOT EXISTS 'makeup';
ALTER TYPE item_category ADD VALUE IF NOT EXISTS 'garments';
ALTER TYPE item_category ADD VALUE IF NOT EXISTS 'cameras';
ALTER TYPE item_category ADD VALUE IF NOT EXISTS 'watches';
ALTER TYPE item_category ADD VALUE IF NOT EXISTS 'home_decor';
ALTER TYPE item_category ADD VALUE IF NOT EXISTS 'books';
ALTER TYPE item_category ADD VALUE IF NOT EXISTS 'music';
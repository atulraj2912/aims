-- AIMS Database Schema for Supabase
-- Run this in the Supabase SQL Editor

-- 1. Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    optimal_stock INTEGER NOT NULL,
    unit VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create replenishment_orders table
CREATE TABLE IF NOT EXISTS replenishment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    current_stock INTEGER NOT NULL,
    optimal_stock INTEGER NOT NULL,
    quantity_to_order INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    priority VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_sku FOREIGN KEY (sku) REFERENCES inventory(sku) ON DELETE CASCADE
);

-- 3. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
CREATE INDEX IF NOT EXISTS idx_orders_status ON replenishment_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON replenishment_orders(created_at DESC);

-- 4. Insert sample data
INSERT INTO inventory (sku, name, current_stock, optimal_stock, unit, location) VALUES
    ('SKU-001', 'Premium Coffee Beans - 1kg', 8, 20, 'bags', 'Warehouse A - Shelf 3'),
    ('SKU-002', 'Organic Tea Leaves - 500g', 3, 15, 'boxes', 'Warehouse A - Shelf 5')
ON CONFLICT (sku) DO NOTHING;

-- 5. Insert sample replenishment orders
INSERT INTO replenishment_orders (sku, item_name, current_stock, optimal_stock, quantity_to_order, status, priority) VALUES
    ('SKU-001', 'Premium Coffee Beans - 1kg', 8, 20, 12, 'pending', 'high'),
    ('SKU-002', 'Organic Tea Leaves - 500g', 3, 15, 12, 'pending', 'critical')
ON CONFLICT DO NOTHING;

-- 6. Enable Row Level Security (RLS)
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE replenishment_orders ENABLE ROW LEVEL SECURITY;

-- 7. Create policies to allow public access (for hackathon demo)
-- NOTE: In production, replace these with proper authentication policies

CREATE POLICY "Allow public read access on inventory"
    ON inventory FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert on inventory"
    ON inventory FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update on inventory"
    ON inventory FOR UPDATE
    USING (true);

CREATE POLICY "Allow public read access on orders"
    ON replenishment_orders FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert on orders"
    ON replenishment_orders FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update on orders"
    ON replenishment_orders FOR UPDATE
    USING (true);

CREATE POLICY "Allow public delete on orders"
    ON replenishment_orders FOR DELETE
    USING (true);

-- 8. Create function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger for replenishment_orders
CREATE TRIGGER update_replenishment_orders_updated_at
    BEFORE UPDATE ON replenishment_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Create function to auto-update inventory last_updated
CREATE OR REPLACE FUNCTION update_inventory_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Create trigger for inventory
CREATE TRIGGER update_inventory_last_updated
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_timestamp();

-- Enhanced AIMS Database Schema for Supabase
-- Run this in the Supabase SQL Editor to add new tables

-- 1. Add fields to inventory table for expiry and pricing
ALTER TABLE inventory
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS barcode VARCHAR(100),
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_defective BOOLEAN DEFAULT FALSE;

-- 2. Create sales_records table to track sales
CREATE TABLE IF NOT EXISTS sales_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity_sold INTEGER NOT NULL,
    sale_price DECIMAL(10, 2) NOT NULL,
    sale_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_sales_sku FOREIGN KEY (sku) REFERENCES inventory(sku) ON DELETE CASCADE
);

-- 3. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- 'low_stock', 'expiring', 'reorder', 'discount', 'defect'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sku VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'dismissed'
    action_data JSONB, -- Store any action-specific data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_notification_sku FOREIGN KEY (sku) REFERENCES inventory(sku) ON DELETE CASCADE
);

-- 4. Create discount_offers table
CREATE TABLE IF NOT EXISTS discount_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    original_price DECIMAL(10, 2) NOT NULL,
    discount_percentage INTEGER NOT NULL,
    discounted_price DECIMAL(10, 2) NOT NULL,
    offer_type VARCHAR(50), -- 'percentage_off', 'buy_one_get_one', 'clearance'
    reason VARCHAR(255), -- 'expiring', 'overstocked', 'slow_moving'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'active', 'expired'
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_offer_sku FOREIGN KEY (sku) REFERENCES inventory(sku) ON DELETE CASCADE
);

-- 5. Create defective_products table
CREATE TABLE IF NOT EXISTS defective_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    defect_description TEXT,
    reported_date TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'reported', -- 'reported', 'return_requested', 'returned', 'resolved'
    supplier_email VARCHAR(255),
    return_request_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_defect_sku FOREIGN KEY (sku) REFERENCES inventory(sku) ON DELETE CASCADE
);

-- 6. Create supplier_returns table
CREATE TABLE IF NOT EXISTS supplier_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    defect_id UUID NOT NULL,
    sku VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    supplier_email VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'requested', -- 'requested', 'approved', 'rejected', 'completed'
    tracking_number VARCHAR(100),
    requested_date TIMESTAMPTZ DEFAULT NOW(),
    completed_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_return_defect FOREIGN KEY (defect_id) REFERENCES defective_products(id) ON DELETE CASCADE,
    CONSTRAINT fk_return_sku FOREIGN KEY (sku) REFERENCES inventory(sku) ON DELETE CASCADE
);

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_sku ON sales_records(sku);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales_records(sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offers_sku ON discount_offers(sku);
CREATE INDEX IF NOT EXISTS idx_offers_status ON discount_offers(status);
CREATE INDEX IF NOT EXISTS idx_defects_sku ON defective_products(sku);
CREATE INDEX IF NOT EXISTS idx_defects_status ON defective_products(status);
CREATE INDEX IF NOT EXISTS idx_returns_status ON supplier_returns(status);

-- 8. Enable Row Level Security
ALTER TABLE sales_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE defective_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_returns ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies (allow all for now - customize based on your auth)
CREATE POLICY "Allow all operations" ON sales_records FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON notifications FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON discount_offers FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON defective_products FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON supplier_returns FOR ALL USING (true);

-- 10. Insert sample sales data
INSERT INTO sales_records (sku, product_name, quantity_sold, sale_price) VALUES
    ('SKU-001', 'Premium Coffee Beans - 1kg', 5, 24.99),
    ('SKU-001', 'Premium Coffee Beans - 1kg', 3, 24.99),
    ('SKU-002', 'Organic Tea Leaves - 500g', 2, 12.99)
ON CONFLICT DO NOTHING;

-- 11. Update existing inventory with sample data
UPDATE inventory 
SET 
    price = 24.99,
    category = 'Beverages',
    barcode = 'BAR' || sku,
    expiry_date = CURRENT_DATE + INTERVAL '90 days'
WHERE sku = 'SKU-001';

UPDATE inventory 
SET 
    price = 12.99,
    category = 'Beverages',
    barcode = 'BAR' || sku,
    expiry_date = CURRENT_DATE + INTERVAL '30 days'
WHERE sku = 'SKU-002';

-- 12. Insert sample notification
INSERT INTO notifications (type, title, message, sku, action_data) VALUES
    ('low_stock', 'Low Stock Alert', 'Premium Coffee Beans is running low. Current stock: 8 units, recommended reorder: 12 units', 'SKU-001', '{"recommended_quantity": 12, "current_stock": 8, "optimal_stock": 20}'::jsonb)
ON CONFLICT DO NOTHING;

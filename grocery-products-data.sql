-- AIMS Grocery Product Database Population
-- 81 products matching the trained AI model classes

-- Clear existing data (optional - comment out if you want to keep existing products)
-- TRUNCATE TABLE inventory CASCADE;

-- Insert all 81 grocery products
INSERT INTO inventory (name, sku, barcode, category, current_stock, optimal_stock, unit, price, location) VALUES

-- Fruits: Apples
('Golden Delicious Apple', 'FRUIT-APP-001', '5000000001', 'Fruits', 50, 100, 30, 2.99, 'Fresh Farms Co.', 'Aisle A1'),
('Granny Smith Apple', 'FRUIT-APP-002', '5000000002', 'Fruits', 45, 100, 30, 2.99, 'Fresh Farms Co.', 'Aisle A1'),
('Pink Lady Apple', 'FRUIT-APP-003', '5000000003', 'Fruits', 40, 100, 30, 3.49, 'Fresh Farms Co.', 'Aisle A1'),
('Red Delicious Apple', 'FRUIT-APP-004', '5000000004', 'Fruits', 55, 100, 30, 2.99, 'Fresh Farms Co.', 'Aisle A1'),
('Royal Gala Apple', 'FRUIT-APP-005', '5000000005', 'Fruits', 48, 100, 30, 2.99, 'Fresh Farms Co.', 'Aisle A1'),

-- Fruits: Other
('Avocado', 'FRUIT-AVO-001', '5000000006', 'Fruits', 30, 60, 20, 1.99, 'Fresh Farms Co.', 'Aisle A1'),
('Banana', 'FRUIT-BAN-001', '5000000007', 'Fruits', 80, 150, 50, 0.99, 'Fresh Farms Co.', 'Aisle A1'),
('Kiwi', 'FRUIT-KIW-001', '5000000008', 'Fruits', 40, 80, 25, 0.79, 'Fresh Farms Co.', 'Aisle A1'),
('Lemon', 'FRUIT-LEM-001', '5000000009', 'Fruits', 35, 70, 20, 0.69, 'Fresh Farms Co.', 'Aisle A1'),
('Lime', 'FRUIT-LIM-001', '5000000010', 'Fruits', 30, 60, 20, 0.59, 'Fresh Farms Co.', 'Aisle A1'),
('Mango', 'FRUIT-MAN-001', '5000000011', 'Fruits', 25, 50, 15, 2.49, 'Fresh Farms Co.', 'Aisle A1'),

-- Fruits: Melons
('Cantaloupe', 'FRUIT-MEL-001', '5000000012', 'Fruits', 20, 40, 12, 4.99, 'Fresh Farms Co.', 'Aisle A2'),
('Galia Melon', 'FRUIT-MEL-002', '5000000013', 'Fruits', 18, 35, 10, 5.49, 'Fresh Farms Co.', 'Aisle A2'),
('Honeydew Melon', 'FRUIT-MEL-003', '5000000014', 'Fruits', 22, 40, 12, 4.99, 'Fresh Farms Co.', 'Aisle A2'),
('Watermelon', 'FRUIT-MEL-004', '5000000015', 'Fruits', 15, 30, 10, 6.99, 'Fresh Farms Co.', 'Aisle A2'),

-- Fruits: Stone Fruits & Citrus
('Nectarine', 'FRUIT-NEC-001', '5000000016', 'Fruits', 28, 55, 18, 2.99, 'Fresh Farms Co.', 'Aisle A2'),
('Orange', 'FRUIT-ORA-001', '5000000017', 'Fruits', 60, 120, 40, 0.89, 'Fresh Farms Co.', 'Aisle A2'),
('Papaya', 'FRUIT-PAP-001', '5000000018', 'Fruits', 20, 40, 12, 3.49, 'Fresh Farms Co.', 'Aisle A2'),
('Passion Fruit', 'FRUIT-PAS-001', '5000000019', 'Fruits', 15, 30, 10, 1.99, 'Fresh Farms Co.', 'Aisle A2'),
('Peach', 'FRUIT-PEA-001', '5000000020', 'Fruits', 30, 60, 20, 2.79, 'Fresh Farms Co.', 'Aisle A2'),

-- Fruits: Pears
('Anjou Pear', 'FRUIT-PER-001', '5000000021', 'Fruits', 25, 50, 15, 2.49, 'Fresh Farms Co.', 'Aisle A2'),
('Conference Pear', 'FRUIT-PER-002', '5000000022', 'Fruits', 22, 45, 15, 2.49, 'Fresh Farms Co.', 'Aisle A2'),
('Kaiser Pear', 'FRUIT-PER-003', '5000000023', 'Fruits', 20, 40, 12, 2.69, 'Fresh Farms Co.', 'Aisle A2'),

-- Fruits: Tropical & Others
('Pineapple', 'FRUIT-PIN-001', '5000000024', 'Fruits', 18, 35, 10, 3.99, 'Fresh Farms Co.', 'Aisle A3'),
('Plum', 'FRUIT-PLU-001', '5000000025', 'Fruits', 25, 50, 15, 2.29, 'Fresh Farms Co.', 'Aisle A3'),
('Pomegranate', 'FRUIT-POM-001', '5000000026', 'Fruits', 15, 30, 10, 3.99, 'Fresh Farms Co.', 'Aisle A3'),
('Red Grapefruit', 'FRUIT-GRA-001', '5000000027', 'Fruits', 20, 40, 12, 1.99, 'Fresh Farms Co.', 'Aisle A3'),
('Satsumas', 'FRUIT-SAT-001', '5000000028', 'Fruits', 30, 60, 20, 1.49, 'Fresh Farms Co.', 'Aisle A3'),

-- Beverages: Juice
('Bravo Apple Juice 1L', 'BEV-JUI-001', '7000000001', 'Beverages', 40, 80, 25, 2.99, 'Beverage Suppliers Inc.', 'Aisle B1'),
('Bravo Orange Juice 1L', 'BEV-JUI-002', '7000000002', 'Beverages', 45, 90, 30, 2.99, 'Beverage Suppliers Inc.', 'Aisle B1'),
('God Morgon Apple Juice', 'BEV-JUI-003', '7000000003', 'Beverages', 35, 70, 22, 3.49, 'Beverage Suppliers Inc.', 'Aisle B1'),
('God Morgon Orange Juice', 'BEV-JUI-004', '7000000004', 'Beverages', 38, 75, 25, 3.49, 'Beverage Suppliers Inc.', 'Aisle B1'),
('God Morgon Orange Red Grapefruit', 'BEV-JUI-005', '7000000005', 'Beverages', 25, 50, 15, 3.49, 'Beverage Suppliers Inc.', 'Aisle B1'),
('God Morgon Red Grapefruit Juice', 'BEV-JUI-006', '7000000006', 'Beverages', 22, 45, 14, 3.49, 'Beverage Suppliers Inc.', 'Aisle B1'),
('Tropicana Apple Juice', 'BEV-JUI-007', '7000000007', 'Beverages', 30, 60, 20, 3.99, 'Beverage Suppliers Inc.', 'Aisle B1'),
('Tropicana Golden Grapefruit', 'BEV-JUI-008', '7000000008', 'Beverages', 25, 50, 15, 3.99, 'Beverage Suppliers Inc.', 'Aisle B1'),
('Tropicana Juice Smooth', 'BEV-JUI-009', '7000000009', 'Beverages', 28, 55, 18, 3.99, 'Beverage Suppliers Inc.', 'Aisle B1'),
('Tropicana Mandarin Morning', 'BEV-JUI-010', '7000000010', 'Beverages', 24, 48, 15, 3.99, 'Beverage Suppliers Inc.', 'Aisle B1'),

-- Dairy: Milk
('Arla Ecological Medium Fat Milk', 'DAIRY-MLK-001', '6000000001', 'Dairy', 50, 100, 35, 4.49, 'Dairy Fresh Ltd.', 'Refrigerated A'),
('Arla Lactose Medium Fat Milk', 'DAIRY-MLK-002', '6000000002', 'Dairy', 35, 70, 25, 4.99, 'Dairy Fresh Ltd.', 'Refrigerated A'),
('Arla Medium Fat Milk', 'DAIRY-MLK-003', '6000000003', 'Dairy', 60, 120, 40, 3.99, 'Dairy Fresh Ltd.', 'Refrigerated A'),
('Arla Standard Milk', 'DAIRY-MLK-004', '6000000004', 'Dairy', 55, 110, 38, 3.79, 'Dairy Fresh Ltd.', 'Refrigerated A'),
('Garant Ecological Medium Fat Milk', 'DAIRY-MLK-005', '6000000005', 'Dairy', 40, 80, 28, 4.29, 'Dairy Fresh Ltd.', 'Refrigerated A'),
('Garant Ecological Standard Milk', 'DAIRY-MLK-006', '6000000006', 'Dairy', 38, 75, 26, 3.99, 'Dairy Fresh Ltd.', 'Refrigerated A'),

-- Dairy: Alternatives
('Oatly Natural Oatghurt', 'DAIRY-OAT-001', '6000000007', 'Dairy Alternatives', 25, 50, 16, 3.49, 'Plant Based Co.', 'Refrigerated B'),
('Oatly Oat Milk', 'DAIRY-OAT-002', '6000000008', 'Dairy Alternatives', 45, 90, 30, 3.99, 'Plant Based Co.', 'Refrigerated B'),
('Arla Ecological Sour Cream', 'DAIRY-SCR-001', '6000000009', 'Dairy', 30, 60, 20, 2.99, 'Dairy Fresh Ltd.', 'Refrigerated B'),
('Arla Sour Cream', 'DAIRY-SCR-002', '6000000010', 'Dairy', 35, 70, 24, 2.49, 'Dairy Fresh Ltd.', 'Refrigerated B'),
('Arla Sour Milk', 'DAIRY-SML-001', '6000000011', 'Dairy', 28, 55, 18, 2.79, 'Dairy Fresh Ltd.', 'Refrigerated B'),

-- Dairy: Soy Products
('Alpro Blueberry Soyghurt', 'DAIRY-SOY-001', '6000000012', 'Dairy Alternatives', 22, 44, 14, 2.99, 'Plant Based Co.', 'Refrigerated C'),
('Alpro Vanilla Soyghurt', 'DAIRY-SOY-002', '6000000013', 'Dairy Alternatives', 24, 48, 15, 2.99, 'Plant Based Co.', 'Refrigerated C'),
('Alpro Fresh Soy Milk', 'DAIRY-SOY-003', '6000000014', 'Dairy Alternatives', 32, 65, 22, 3.49, 'Plant Based Co.', 'Refrigerated C'),
('Alpro Shelf Soy Milk', 'DAIRY-SOY-004', '6000000015', 'Dairy Alternatives', 40, 80, 26, 3.29, 'Plant Based Co.', 'Aisle C1'),

-- Dairy: Yoghurt
('Arla Mild Vanilla Yoghurt', 'DAIRY-YOG-001', '6000000016', 'Dairy', 45, 90, 30, 2.49, 'Dairy Fresh Ltd.', 'Refrigerated D'),
('Arla Natural Mild Low Fat Yoghurt', 'DAIRY-YOG-002', '6000000017', 'Dairy', 40, 80, 28, 2.29, 'Dairy Fresh Ltd.', 'Refrigerated D'),
('Arla Natural Yoghurt', 'DAIRY-YOG-003', '6000000018', 'Dairy', 50, 100, 35, 2.19, 'Dairy Fresh Ltd.', 'Refrigerated D'),
('Valio Vanilla Yoghurt', 'DAIRY-YOG-004', '6000000019', 'Dairy', 35, 70, 24, 2.59, 'Dairy Fresh Ltd.', 'Refrigerated D'),
('Yoggi Strawberry Yoghurt', 'DAIRY-YOG-005', '6000000020', 'Dairy', 38, 75, 26, 1.99, 'Dairy Fresh Ltd.', 'Refrigerated D'),
('Yoggi Vanilla Yoghurt', 'DAIRY-YOG-006', '6000000021', 'Dairy', 40, 80, 28, 1.99, 'Dairy Fresh Ltd.', 'Refrigerated D'),

-- Vegetables
('Asparagus 500g', 'VEG-ASP-001', '8000000001', 'Vegetables', 20, 40, 12, 4.99, 'Fresh Farms Co.', 'Aisle D1'),
('Aubergine', 'VEG-AUB-001', '8000000002', 'Vegetables', 25, 50, 16, 2.49, 'Fresh Farms Co.', 'Aisle D1'),
('Cabbage', 'VEG-CAB-001', '8000000003', 'Vegetables', 30, 60, 20, 1.99, 'Fresh Farms Co.', 'Aisle D1'),
('Carrots 1kg', 'VEG-CAR-001', '8000000004', 'Vegetables', 45, 90, 30, 1.49, 'Fresh Farms Co.', 'Aisle D1'),
('Cucumber', 'VEG-CUC-001', '8000000005', 'Vegetables', 35, 70, 24, 0.99, 'Fresh Farms Co.', 'Aisle D1'),
('Garlic 200g', 'VEG-GAR-001', '8000000006', 'Vegetables', 30, 60, 20, 1.79, 'Fresh Farms Co.', 'Aisle D2'),
('Ginger Root', 'VEG-GIN-001', '8000000007', 'Vegetables', 25, 50, 16, 2.99, 'Fresh Farms Co.', 'Aisle D2'),
('Leek', 'VEG-LEE-001', '8000000008', 'Vegetables', 22, 44, 14, 1.99, 'Fresh Farms Co.', 'Aisle D2'),
('Brown Cap Mushroom 250g', 'VEG-MUS-001', '8000000009', 'Vegetables', 28, 55, 18, 2.49, 'Fresh Farms Co.', 'Aisle D2'),
('Yellow Onion 1kg', 'VEG-ONI-001', '8000000010', 'Vegetables', 50, 100, 34, 1.29, 'Fresh Farms Co.', 'Aisle D2'),

-- Vegetables: Peppers
('Green Bell Pepper', 'VEG-PEP-001', '8000000011', 'Vegetables', 30, 60, 20, 1.49, 'Fresh Farms Co.', 'Aisle D3'),
('Orange Bell Pepper', 'VEG-PEP-002', '8000000012', 'Vegetables', 28, 55, 18, 1.79, 'Fresh Farms Co.', 'Aisle D3'),
('Red Bell Pepper', 'VEG-PEP-003', '8000000013', 'Vegetables', 32, 65, 22, 1.69, 'Fresh Farms Co.', 'Aisle D3'),
('Yellow Bell Pepper', 'VEG-PEP-004', '8000000014', 'Vegetables', 26, 52, 17, 1.79, 'Fresh Farms Co.', 'Aisle D3'),

-- Vegetables: Potatoes
('Floury Potato 2kg', 'VEG-POT-001', '8000000015', 'Vegetables', 40, 80, 26, 2.99, 'Fresh Farms Co.', 'Aisle D3'),
('Solid Potato 2kg', 'VEG-POT-002', '8000000016', 'Vegetables', 38, 75, 25, 2.79, 'Fresh Farms Co.', 'Aisle D3'),
('Sweet Potato', 'VEG-POT-003', '8000000017', 'Vegetables', 30, 60, 20, 1.99, 'Fresh Farms Co.', 'Aisle D3'),

-- Vegetables: Root & Tomatoes
('Red Beet 500g', 'VEG-BEE-001', '8000000018', 'Vegetables', 25, 50, 16, 1.99, 'Fresh Farms Co.', 'Aisle D4'),
('Beef Tomato', 'VEG-TOM-001', '8000000019', 'Vegetables', 35, 70, 24, 2.49, 'Fresh Farms Co.', 'Aisle D4'),
('Regular Tomato 500g', 'VEG-TOM-002', '8000000020', 'Vegetables', 45, 90, 30, 1.99, 'Fresh Farms Co.', 'Aisle D4'),
('Vine Tomato', 'VEG-TOM-003', '8000000021', 'Vegetables', 40, 80, 28, 2.29, 'Fresh Farms Co.', 'Aisle D4'),
('Zucchini', 'VEG-ZUC-001', '8000000022', 'Vegetables', 30, 60, 20, 1.49, 'Fresh Farms Co.', 'Aisle D4');

-- Summary
SELECT 
    category,
    COUNT(*) as product_count,
    SUM(currentStock) as total_stock
FROM inventory
GROUP BY category
ORDER BY category;

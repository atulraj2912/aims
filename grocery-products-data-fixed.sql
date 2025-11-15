-- AIMS Grocery Product Database Population
-- 81 products matching the trained AI model classes

-- Clear existing data to avoid duplicate key errors
DELETE FROM inventory WHERE sku LIKE 'FRUIT-%' OR sku LIKE 'BEV-%' OR sku LIKE 'DAIRY-%' OR sku LIKE 'ALT-%' OR sku LIKE 'VEG-%';

-- Insert all 81 grocery products
INSERT INTO inventory (name, sku, barcode, category, current_stock, optimal_stock, unit, price, location) VALUES

-- Fruits: Apples
('Golden Delicious Apple', 'FRUIT-APP-001', '5000000001', 'Fruits', 25, 100, 'kg', 2.99, 'Aisle A1'),
('Granny Smith Apple', 'FRUIT-APP-002', '5000000002', 'Fruits', 22, 100, 'kg', 2.99, 'Aisle A1'),
('Pink Lady Apple', 'FRUIT-APP-003', '5000000003', 'Fruits', 20, 100, 'kg', 3.49, 'Aisle A1'),
('Red Delicious Apple', 'FRUIT-APP-004', '5000000004', 'Fruits', 27, 100, 'kg', 2.99, 'Aisle A1'),
('Royal Gala Apple', 'FRUIT-APP-005', '5000000005', 'Fruits', 24, 100, 'kg', 2.99, 'Aisle A1'),

-- Fruits: Other
('Avocado', 'FRUIT-AVO-001', '5000000006', 'Fruits', 15, 60, 'piece', 1.99, 'Aisle A1'),
('Banana', 'FRUIT-BAN-001', '5000000007', 'Fruits', 40, 150, 'kg', 0.99, 'Aisle A1'),
('Kiwi', 'FRUIT-KIW-001', '5000000008', 'Fruits', 20, 80, 'piece', 0.79, 'Aisle A1'),
('Lemon', 'FRUIT-LEM-001', '5000000009', 'Fruits', 17, 70, 'kg', 1.49, 'Aisle A1'),
('Lime', 'FRUIT-LIM-001', '5000000010', 'Fruits', 15, 60, 'kg', 1.49, 'Aisle A1'),
('Mango', 'FRUIT-MAN-001', '5000000011', 'Fruits', 12, 50, 'piece', 2.49, 'Aisle A1'),
('Orange', 'FRUIT-ORA-001', '5000000012', 'Fruits', 30, 120, 'kg', 1.99, 'Aisle A1'),

-- Fruits: Melons
('Cantaloupe', 'FRUIT-MEL-001', '5000000013', 'Fruits', 10, 40, 'piece', 3.99, 'Aisle A1'),
('Honeydew Melon', 'FRUIT-MEL-002', '5000000014', 'Fruits', 9, 36, 'piece', 4.49, 'Aisle A1'),
('Watermelon', 'FRUIT-MEL-003', '5000000015', 'Fruits', 7, 30, 'piece', 5.99, 'Aisle A1'),

-- Fruits: Pears
('Conference Pear', 'FRUIT-PEA-001', '5000000016', 'Fruits', 15, 60, 'kg', 2.79, 'Aisle A1'),
('Kaiser Pear', 'FRUIT-PEA-002', '5000000017', 'Fruits', 14, 56, 'kg', 2.99, 'Aisle A1'),

-- Fruits: Tropical
('Passion Fruit', 'FRUIT-TRO-001', '5000000018', 'Fruits', 10, 40, 'piece', 1.99, 'Aisle A1'),
('Pineapple', 'FRUIT-TRO-002', '5000000019', 'Fruits', 11, 44, 'piece', 3.49, 'Aisle A1'),
('Pomegranate', 'FRUIT-TRO-003', '5000000020', 'Fruits', 9, 36, 'piece', 2.99, 'Aisle A1'),

-- Fruits: Berries & Others
('Nectarine', 'FRUIT-NEC-001', '5000000021', 'Fruits', 12, 50, 'kg', 3.29, 'Aisle A1'),
('Peach', 'FRUIT-PEA-003', '5000000022', 'Fruits', 14, 56, 'kg', 3.49, 'Aisle A1'),
('Plum', 'FRUIT-PLU-001', '5000000023', 'Fruits', 15, 60, 'kg', 2.99, 'Aisle A1'),
('Red Grapefruit', 'FRUIT-GRA-001', '5000000024', 'Fruits', 12, 50, 'piece', 1.79, 'Aisle A1'),
('Satsumas', 'FRUIT-SAT-001', '5000000025', 'Fruits', 20, 80, 'kg', 2.49, 'Aisle A1'),
('Strawberry', 'FRUIT-STR-001', '5000000026', 'Fruits', 17, 70, 'punnet', 3.99, 'Aisle A2'),
('Yellow Onion', 'VEG-ONI-001', '5000000027', 'Vegetables', 25, 100, 'kg', 1.29, 'Aisle B1'),
('Green Grapes', 'FRUIT-GRA-002', '5000000028', 'Fruits', 16, 64, 'kg', 4.99, 'Aisle A2'),

-- Beverages: Juice
('Bravo Apple Juice 1L', 'BEV-JUI-001', '5000000029', 'Beverages', 20, 80, 'bottle', 2.49, 'Aisle C1'),
('Bravo Orange Juice 1L', 'BEV-JUI-002', '5000000030', 'Beverages', 22, 90, 'bottle', 2.49, 'Aisle C1'),
('God Morgon Apple Juice 1L', 'BEV-JUI-003', '5000000031', 'Beverages', 17, 70, 'bottle', 2.79, 'Aisle C1'),
('God Morgon Orange Juice 1L', 'BEV-JUI-004', '5000000032', 'Beverages', 19, 76, 'bottle', 2.79, 'Aisle C1'),
('God Morgon Red Grapefruit Juice 1L', 'BEV-JUI-005', '5000000033', 'Beverages', 15, 60, 'bottle', 2.99, 'Aisle C1'),
('Tropicana Apple Juice 1L', 'BEV-JUI-006', '5000000034', 'Beverages', 21, 84, 'bottle', 3.29, 'Aisle C1'),
('Tropicana Golden Grapefruit 1L', 'BEV-JUI-007', '5000000035', 'Beverages', 14, 56, 'bottle', 3.49, 'Aisle C1'),
('Tropicana Juice Smooth 1L', 'BEV-JUI-008', '5000000036', 'Beverages', 16, 64, 'bottle', 3.49, 'Aisle C1'),
('Tropicana Mandarin Morning 1L', 'BEV-JUI-009', '5000000037', 'Beverages', 15, 60, 'bottle', 3.29, 'Aisle C1'),
('Tropicana Multivitamin 1L', 'BEV-JUI-010', '5000000038', 'Beverages', 17, 70, 'bottle', 3.49, 'Aisle C1'),

-- Dairy: Milk
('Arla Ecological Medium Fat Milk 1.5%', 'DAIRY-MLK-001', '5000000039', 'Dairy', 25, 100, 'liter', 1.99, 'Aisle D1'),
('Arla Lactose Medium Fat Milk 1.5%', 'DAIRY-MLK-002', '5000000040', 'Dairy', 17, 70, 'liter', 2.29, 'Aisle D1'),
('Arla Medium Fat Milk 1.5%', 'DAIRY-MLK-003', '5000000041', 'Dairy', 30, 120, 'liter', 1.79, 'Aisle D1'),
('Arla Standard Milk 3%', 'DAIRY-MLK-004', '5000000042', 'Dairy', 27, 110, 'liter', 1.79, 'Aisle D1'),
('Garant Ecological Medium Fat Milk 1.5%', 'DAIRY-MLK-005', '5000000043', 'Dairy', 20, 80, 'liter', 1.89, 'Aisle D1'),
('Garant Ecological Standard Milk 3%', 'DAIRY-MLK-006', '5000000044', 'Dairy', 19, 76, 'liter', 1.89, 'Aisle D1'),

-- Dairy: Yoghurt
('Arla Mild Vanilla Yoghurt', 'DAIRY-YOG-001', '5000000045', 'Dairy', 22, 90, 'piece', 0.99, 'Aisle D2'),
('Arla Mild Yoghurt', 'DAIRY-YOG-002', '5000000046', 'Dairy', 25, 100, 'piece', 0.89, 'Aisle D2'),
('Arla Natural Mild Lactose Free Yoghurt', 'DAIRY-YOG-003', '5000000047', 'Dairy', 15, 60, 'piece', 1.29, 'Aisle D2'),
('Arla Natural Yoghurt', 'DAIRY-YOG-004', '5000000048', 'Dairy', 24, 96, 'piece', 0.89, 'Aisle D2'),
('Valio Vanilla Yoghurt', 'DAIRY-YOG-005', '5000000049', 'Dairy', 21, 84, 'piece', 1.09, 'Aisle D2'),
('Yoggi Strawberry Yoghurt', 'DAIRY-YOG-006', '5000000050', 'Dairy', 20, 80, 'piece', 0.99, 'Aisle D2'),
('Yoggi Vanilla Yoghurt 0.4%', 'DAIRY-YOG-007', '5000000051', 'Dairy', 19, 76, 'piece', 0.99, 'Aisle D2'),
('Yoggi Yoghurt 0.4%', 'DAIRY-YOG-008', '5000000052', 'Dairy', 22, 88, 'piece', 0.89, 'Aisle D2'),

-- Dairy: Sour Products
('Arla Sour Cream', 'DAIRY-SOU-001', '5000000053', 'Dairy', 17, 70, 'piece', 1.49, 'Aisle D2'),
('Arla Sour Milk', 'DAIRY-SOU-002', '5000000054', 'Dairy', 16, 64, 'liter', 1.79, 'Aisle D1'),
('Cream Cheese', 'DAIRY-CHE-001', '5000000055', 'Dairy', 20, 80, 'piece', 2.49, 'Aisle D2'),
('Creme Fraiche', 'DAIRY-CRE-001', '5000000056', 'Dairy', 19, 76, 'piece', 1.79, 'Aisle D2'),
('Sour Cream', 'DAIRY-SOU-003', '5000000057', 'Dairy', 18, 72, 'piece', 1.49, 'Aisle D2'),
('Turkish Yoghurt', 'DAIRY-YOG-009', '5000000058', 'Dairy', 15, 60, 'piece', 2.29, 'Aisle D2'),

-- Dairy Alternatives: Oat
('Oatly Oat Milk', 'ALT-OAT-001', '5000000059', 'Dairy Alternatives', 22, 90, 'liter', 2.49, 'Aisle D3'),
('Oatly Oat Yoghurt', 'ALT-OAT-002', '5000000060', 'Dairy Alternatives', 17, 70, 'piece', 1.79, 'Aisle D3'),
('Oatly Sour Cream', 'ALT-OAT-003', '5000000061', 'Dairy Alternatives', 14, 56, 'piece', 1.99, 'Aisle D3'),

-- Dairy Alternatives: Soy
('Alpro Fresh Soy Milk', 'ALT-SOY-001', '5000000062', 'Dairy Alternatives', 20, 80, 'liter', 2.29, 'Aisle D3'),
('Alpro Shelf Soy Milk', 'ALT-SOY-002', '5000000063', 'Dairy Alternatives', 25, 100, 'liter', 2.19, 'Aisle D3'),
('Alpro Soy Yoghurt', 'ALT-SOY-003', '5000000064', 'Dairy Alternatives', 16, 64, 'piece', 1.69, 'Aisle D3'),

-- Vegetables: Peppers
('Orange Bell Pepper', 'VEG-PEP-001', '5000000065', 'Vegetables', 17, 70, 'kg', 3.49, 'Aisle B1'),
('Red Bell Pepper', 'VEG-PEP-002', '5000000066', 'Vegetables', 20, 80, 'kg', 3.49, 'Aisle B1'),
('Yellow Bell Pepper', 'VEG-PEP-003', '5000000067', 'Vegetables', 19, 76, 'kg', 3.49, 'Aisle B1'),

-- Vegetables: Root & Tubers
('Brown Cap Mushroom', 'VEG-MUS-001', '5000000068', 'Vegetables', 15, 60, 'kg', 4.99, 'Aisle B2'),
('Carrots', 'VEG-CAR-001', '5000000069', 'Vegetables', 27, 110, 'kg', 1.49, 'Aisle B1'),
('Ginger Root', 'VEG-GIN-001', '5000000070', 'Vegetables', 10, 40, 'kg', 5.99, 'Aisle B2'),
('Red Beet', 'VEG-BEE-001', '5000000071', 'Vegetables', 12, 50, 'kg', 1.99, 'Aisle B1'),
('White Cabbage', 'VEG-CAB-001', '5000000072', 'Vegetables', 14, 56, 'piece', 2.49, 'Aisle B2'),

-- Vegetables: Potatoes & Tomatoes
('Floury Potato', 'VEG-POT-001', '5000000073', 'Vegetables', 30, 120, 'kg', 1.29, 'Aisle B1'),
('Solid Potato', 'VEG-POT-002', '5000000074', 'Vegetables', 32, 130, 'kg', 1.29, 'Aisle B1'),
('Sweet Potato', 'VEG-POT-003', '5000000075', 'Vegetables', 17, 70, 'kg', 2.49, 'Aisle B1'),
('Beef Tomato', 'VEG-TOM-001', '5000000076', 'Vegetables', 15, 60, 'kg', 3.99, 'Aisle B2'),
('Regular Tomato', 'VEG-TOM-002', '5000000077', 'Vegetables', 22, 90, 'kg', 2.99, 'Aisle B2'),
('Vine Tomato', 'VEG-TOM-003', '5000000078', 'Vegetables', 19, 76, 'kg', 3.49, 'Aisle B2'),

-- Vegetables: Other
('Asparagus', 'VEG-ASP-001', '5000000079', 'Vegetables', 11, 44, 'kg', 6.99, 'Aisle B2'),
('Cucumber', 'VEG-CUC-001', '5000000080', 'Vegetables', 20, 80, 'piece', 1.49, 'Aisle B2'),
('Zucchini', 'VEG-ZUC-001', '5000000081', 'Vegetables', 16, 64, 'kg', 2.99, 'Aisle B2');

-- Success message
SELECT 'Successfully inserted 81 grocery products!' AS status;

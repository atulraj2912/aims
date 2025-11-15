// Script to generate grocery store inventory data
// Run with: npx tsx scripts/generate-grocery-data.ts

const groceryProducts = [
  // Produce
  { name: "Fresh Bananas", sku: "PROD-001", currentStock: 150, optimalStock: 200, unit: "kg", location: "Aisle 1 - Produce" },
  { name: "Red Apples", sku: "PROD-002", currentStock: 80, optimalStock: 180, unit: "kg", location: "Aisle 1 - Produce" },
  { name: "Tomatoes", sku: "PROD-003", currentStock: 45, optimalStock: 120, unit: "kg", location: "Aisle 1 - Produce" },
  { name: "Cucumbers", sku: "PROD-004", currentStock: 30, optimalStock: 90, unit: "kg", location: "Aisle 1 - Produce" },
  { name: "Carrots", sku: "PROD-005", currentStock: 60, optimalStock: 100, unit: "kg", location: "Aisle 1 - Produce" },
  { name: "Lettuce", sku: "PROD-006", currentStock: 40, optimalStock: 80, unit: "pcs", location: "Aisle 1 - Produce" },
  { name: "Potatoes", sku: "PROD-007", currentStock: 200, optimalStock: 250, unit: "kg", location: "Aisle 1 - Produce" },
  { name: "Onions", sku: "PROD-008", currentStock: 90, optimalStock: 150, unit: "kg", location: "Aisle 1 - Produce" },
  { name: "Bell Peppers", sku: "PROD-009", currentStock: 25, optimalStock: 70, unit: "kg", location: "Aisle 1 - Produce" },
  { name: "Broccoli", sku: "PROD-010", currentStock: 15, optimalStock: 60, unit: "kg", location: "Aisle 1 - Produce" },

  // Dairy
  { name: "Whole Milk 1L", sku: "DAIRY-001", currentStock: 120, optimalStock: 200, unit: "pcs", location: "Aisle 2 - Dairy" },
  { name: "Skimmed Milk 1L", sku: "DAIRY-002", currentStock: 85, optimalStock: 150, unit: "pcs", location: "Aisle 2 - Dairy" },
  { name: "Cheddar Cheese 200g", sku: "DAIRY-003", currentStock: 40, optimalStock: 100, unit: "pcs", location: "Aisle 2 - Dairy" },
  { name: "Greek Yogurt 500g", sku: "DAIRY-004", currentStock: 65, optimalStock: 120, unit: "pcs", location: "Aisle 2 - Dairy" },
  { name: "Butter 250g", sku: "DAIRY-005", currentStock: 50, optimalStock: 90, unit: "pcs", location: "Aisle 2 - Dairy" },
  { name: "Fresh Eggs (12 pack)", sku: "DAIRY-006", currentStock: 95, optimalStock: 180, unit: "pcs", location: "Aisle 2 - Dairy" },
  { name: "Cream Cheese 200g", sku: "DAIRY-007", currentStock: 30, optimalStock: 80, unit: "pcs", location: "Aisle 2 - Dairy" },
  { name: "Mozzarella Cheese 250g", sku: "DAIRY-008", currentStock: 45, optimalStock: 90, unit: "pcs", location: "Aisle 2 - Dairy" },

  // Bakery
  { name: "White Bread Loaf", sku: "BAK-001", currentStock: 75, optimalStock: 150, unit: "pcs", location: "Aisle 3 - Bakery" },
  { name: "Whole Wheat Bread", sku: "BAK-002", currentStock: 60, optimalStock: 120, unit: "pcs", location: "Aisle 3 - Bakery" },
  { name: "Croissants (6 pack)", sku: "BAK-003", currentStock: 35, optimalStock: 80, unit: "pcs", location: "Aisle 3 - Bakery" },
  { name: "Bagels (6 pack)", sku: "BAK-004", currentStock: 40, optimalStock: 90, unit: "pcs", location: "Aisle 3 - Bakery" },
  { name: "Dinner Rolls (12 pack)", sku: "BAK-005", currentStock: 25, optimalStock: 70, unit: "pcs", location: "Aisle 3 - Bakery" },

  // Meat & Seafood
  { name: "Chicken Breast", sku: "MEAT-001", currentStock: 80, optimalStock: 150, unit: "kg", location: "Aisle 4 - Meat" },
  { name: "Ground Beef", sku: "MEAT-002", currentStock: 65, optimalStock: 120, unit: "kg", location: "Aisle 4 - Meat" },
  { name: "Pork Chops", sku: "MEAT-003", currentStock: 40, optimalStock: 90, unit: "kg", location: "Aisle 4 - Meat" },
  { name: "Salmon Fillets", sku: "MEAT-004", currentStock: 30, optimalStock: 80, unit: "kg", location: "Aisle 4 - Meat" },
  { name: "Shrimp", sku: "MEAT-005", currentStock: 20, optimalStock: 60, unit: "kg", location: "Aisle 4 - Meat" },
  { name: "Turkey Slices 200g", sku: "MEAT-006", currentStock: 45, optimalStock: 100, unit: "pcs", location: "Aisle 4 - Meat" },

  // Frozen Foods
  { name: "Frozen Pizza", sku: "FRZ-001", currentStock: 90, optimalStock: 150, unit: "pcs", location: "Aisle 5 - Frozen" },
  { name: "Ice Cream 1L", sku: "FRZ-002", currentStock: 110, optimalStock: 180, unit: "pcs", location: "Aisle 5 - Frozen" },
  { name: "Frozen Vegetables 500g", sku: "FRZ-003", currentStock: 70, optimalStock: 140, unit: "pcs", location: "Aisle 5 - Frozen" },
  { name: "Frozen French Fries", sku: "FRZ-004", currentStock: 85, optimalStock: 160, unit: "pcs", location: "Aisle 5 - Frozen" },
  { name: "Frozen Chicken Nuggets", sku: "FRZ-005", currentStock: 55, optimalStock: 120, unit: "pcs", location: "Aisle 5 - Frozen" },

  // Beverages
  { name: "Coca Cola 2L", sku: "BEV-001", currentStock: 200, optimalStock: 300, unit: "pcs", location: "Aisle 6 - Beverages" },
  { name: "Orange Juice 1L", sku: "BEV-002", currentStock: 95, optimalStock: 180, unit: "pcs", location: "Aisle 6 - Beverages" },
  { name: "Mineral Water 1.5L", sku: "BEV-003", currentStock: 250, optimalStock: 400, unit: "pcs", location: "Aisle 6 - Beverages" },
  { name: "Coffee Beans 500g", sku: "BEV-004", currentStock: 60, optimalStock: 120, unit: "pcs", location: "Aisle 6 - Beverages" },
  { name: "Green Tea Bags (100)", sku: "BEV-005", currentStock: 40, optimalStock: 90, unit: "pcs", location: "Aisle 6 - Beverages" },
  { name: "Energy Drink 250ml", sku: "BEV-006", currentStock: 130, optimalStock: 200, unit: "pcs", location: "Aisle 6 - Beverages" },

  // Pantry/Dry Goods
  { name: "White Rice 5kg", sku: "DRY-001", currentStock: 75, optimalStock: 150, unit: "pcs", location: "Aisle 7 - Pantry" },
  { name: "Pasta 500g", sku: "DRY-002", currentStock: 100, optimalStock: 180, unit: "pcs", location: "Aisle 7 - Pantry" },
  { name: "All-Purpose Flour 2kg", sku: "DRY-003", currentStock: 50, optimalStock: 120, unit: "pcs", location: "Aisle 7 - Pantry" },
  { name: "Sugar 1kg", sku: "DRY-004", currentStock: 80, optimalStock: 140, unit: "pcs", location: "Aisle 7 - Pantry" },
  { name: "Olive Oil 1L", sku: "DRY-005", currentStock: 45, optimalStock: 100, unit: "pcs", location: "Aisle 7 - Pantry" },
  { name: "Canned Tomatoes 400g", sku: "DRY-006", currentStock: 120, optimalStock: 200, unit: "pcs", location: "Aisle 7 - Pantry" },
  { name: "Peanut Butter 500g", sku: "DRY-007", currentStock: 55, optimalStock: 110, unit: "pcs", location: "Aisle 7 - Pantry" },
  { name: "Breakfast Cereal 500g", sku: "DRY-008", currentStock: 90, optimalStock: 160, unit: "pcs", location: "Aisle 7 - Pantry" },
  { name: "Canned Beans 400g", sku: "DRY-009", currentStock: 70, optimalStock: 140, unit: "pcs", location: "Aisle 7 - Pantry" },
  { name: "Spaghetti Sauce 500g", sku: "DRY-010", currentStock: 65, optimalStock: 130, unit: "pcs", location: "Aisle 7 - Pantry" },

  // Snacks
  { name: "Potato Chips 200g", sku: "SNK-001", currentStock: 110, optimalStock: 200, unit: "pcs", location: "Aisle 8 - Snacks" },
  { name: "Chocolate Bars", sku: "SNK-002", currentStock: 150, optimalStock: 250, unit: "pcs", location: "Aisle 8 - Snacks" },
  { name: "Cookies 300g", sku: "SNK-003", currentStock: 85, optimalStock: 160, unit: "pcs", location: "Aisle 8 - Snacks" },
  { name: "Granola Bars (6 pack)", sku: "SNK-004", currentStock: 70, optimalStock: 140, unit: "pcs", location: "Aisle 8 - Snacks" },
  { name: "Nuts Mix 250g", sku: "SNK-005", currentStock: 50, optimalStock: 100, unit: "pcs", location: "Aisle 8 - Snacks" },
  { name: "Popcorn Kernels 500g", sku: "SNK-006", currentStock: 40, optimalStock: 90, unit: "pcs", location: "Aisle 8 - Snacks" },

  // Household/Cleaning
  { name: "Laundry Detergent 2L", sku: "HH-001", currentStock: 60, optimalStock: 120, unit: "pcs", location: "Aisle 9 - Household" },
  { name: "Dish Soap 500ml", sku: "HH-002", currentStock: 75, optimalStock: 140, unit: "pcs", location: "Aisle 9 - Household" },
  { name: "Paper Towels (6 roll)", sku: "HH-003", currentStock: 90, optimalStock: 180, unit: "pcs", location: "Aisle 9 - Household" },
  { name: "Toilet Paper (12 roll)", sku: "HH-004", currentStock: 140, optimalStock: 250, unit: "pcs", location: "Aisle 9 - Household" },
  { name: "Trash Bags (50 pack)", sku: "HH-005", currentStock: 55, optimalStock: 110, unit: "pcs", location: "Aisle 9 - Household" },
  { name: "All-Purpose Cleaner 1L", sku: "HH-006", currentStock: 45, optimalStock: 100, unit: "pcs", location: "Aisle 9 - Household" },

  // Personal Care
  { name: "Shampoo 400ml", sku: "PC-001", currentStock: 80, optimalStock: 150, unit: "pcs", location: "Aisle 10 - Personal Care" },
  { name: "Toothpaste 100ml", sku: "PC-002", currentStock: 100, optimalStock: 180, unit: "pcs", location: "Aisle 10 - Personal Care" },
  { name: "Body Soap 200g", sku: "PC-003", currentStock: 70, optimalStock: 140, unit: "pcs", location: "Aisle 10 - Personal Care" },
  { name: "Deodorant 50ml", sku: "PC-004", currentStock: 65, optimalStock: 130, unit: "pcs", location: "Aisle 10 - Personal Care" },
  { name: "Hand Sanitizer 250ml", sku: "PC-005", currentStock: 90, optimalStock: 160, unit: "pcs", location: "Aisle 10 - Personal Care" },
];

async function generateGroceryData() {
  console.log('🛒 Starting grocery store data generation...\n');
  
  let successCount = 0;
  let failCount = 0;

  for (const product of groceryProducts) {
    try {
      const response = await fetch('http://localhost:3000/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      const result = await response.json();
      
      if (result.success) {
        successCount++;
        console.log(`✅ Added: ${product.name} (${product.sku})`);
      } else {
        failCount++;
        console.log(`❌ Failed: ${product.name} - ${result.error}`);
      }
    } catch (error) {
      failCount++;
      console.log(`❌ Error adding ${product.name}:`, error);
    }
  }

  console.log('\n📊 Generation Complete!');
  console.log(`✅ Successfully added: ${successCount} products`);
  console.log(`❌ Failed: ${failCount} products`);
  console.log(`📦 Total: ${groceryProducts.length} products\n`);
}

generateGroceryData();

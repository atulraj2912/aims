// Test the ML model with sample data
const testData = {
  items: [
    {
      sku: "SKU001",
      name: "Gaming Laptop",
      currentStock: 45,
      unitsOrdered: 20,
      demandForecast: 150,
      price: 899.99,
      isHoliday: false,
      competitorPrice: 949.99,
      productId: "P0002",
      category: "Electronics",
      seasonality: "Winter"
    },
    {
      sku: "SKU002",
      name: "Office Chair",
      currentStock: 30,
      unitsOrdered: 15,
      demandForecast: 80,
      price: 199.99,
      isHoliday: true,
      competitorPrice: 189.99,
      productId: "P0005",
      category: "Furniture",
      seasonality: "Spring"
    },
    {
      sku: "SKU003",
      name: "Organic Milk",
      currentStock: 120,
      unitsOrdered: 100,
      demandForecast: 300,
      price: 4.99,
      isHoliday: false,
      competitorPrice: 5.49,
      productId: "P0010",
      category: "Groceries",
      seasonality: "Summer"
    }
  ]
};

fetch('http://localhost:5001/api/predict-inventory-sales', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
  .then(res => res.json())
  .then(data => {
    console.log('✅ Predictions:', data);
    data.predictions.forEach(pred => {
      console.log(`\n📦 ${pred.name} (${pred.sku})`);
      console.log(`   Predicted Sales: ${pred.predictedSales.toFixed(2)} units`);
      console.log(`   Current Stock: ${pred.currentStock}`);
      console.log(`   Days Until Stockout: ${pred.daysUntilStockout}`);
      console.log(`   Recommended Order: ${pred.recommendedOrder} units`);
    });
  })
  .catch(err => console.error('❌ Error:', err));

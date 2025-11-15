// Supplier Configuration
// Edit the email addresses below to match your actual supplier contacts

export interface SupplierContact {
  name: string;
  email: string;
  phone?: string;
  categories: string[]; // Categories this supplier handles
}

export const supplierContacts: Record<string, SupplierContact> = {
  'Fresh Produce Co.': {
    name: 'Fresh Produce Co.',
    email: 'aryan62056@gmail.com', // Testing with your email
    phone: '+91-9876543210',
    categories: ['Fruit']
  },
  'Green Valley Farms': {
    name: 'Green Valley Farms',
    email: 'aryan62056@gmail.com', // Testing with your email
    phone: '+91-9876543211',
    categories: ['Vegetable']
  },
  'Dairy Direct Ltd.': {
    name: 'Dairy Direct Ltd.',
    email: 'aryan62056@gmail.com', // Testing with your email
    phone: '+91-9876543212',
    categories: ['Dairy']
  },
  'General Supplies Inc.': {
    name: 'General Supplies Inc.',
    email: 'aryan62056@gmail.com', // Testing with your email
    phone: '+91-9876543213',
    categories: ['Snacks', 'Beverage', 'Personal Care', 'Household']
  }
};

// Helper function to get supplier by category
export function getSupplierByCategory(category: string): SupplierContact {
  for (const supplier of Object.values(supplierContacts)) {
    if (supplier.categories.includes(category)) {
      return supplier;
    }
  }
  // Default fallback
  return supplierContacts['General Supplies Inc.'];
}

// Helper function to get supplier name by category (for backward compatibility)
export function getSupplierNameByCategory(category: string): string {
  const supplier = getSupplierByCategory(category);
  return supplier.name;
}

// Helper function to get supplier email by name
export function getSupplierEmail(supplierName: string): string {
  return supplierContacts[supplierName]?.email || 'supplier@example.com';
}

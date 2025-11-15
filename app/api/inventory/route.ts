import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { emitInventoryUpdate } from '@/lib/socket';
import { mockInventory } from '@/lib/mockData';

// GET /api/inventory - Fetch all inventory items from Supabase
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('sku', { ascending: true });

    if (error) {
      console.warn('Supabase error, using mock data:', error.message);
      // Fallback to mock data if Supabase fails
      return NextResponse.json({
        success: true,
        data: mockInventory,
        lastSync: new Date().toISOString(),
        usingMockData: true
      });
    }

    // Transform database format to match frontend expectations
    const transformedData = data.map(item => ({
      id: item.id,
      sku: item.sku,
      name: item.name,
      barcode: item.barcode,
      category: item.category,
      price: item.price,
      currentStock: item.current_stock,
      optimalStock: item.optimal_stock,
      expiryDate: item.expiry_date,
      discountPercentage: item.discount_percentage,
      isDefective: item.is_defective,
      unit: item.unit,
      lastUpdated: item.last_updated,
      location: item.location || 'Unknown'
    }));

    return NextResponse.json({
      success: true,
      data: transformedData,
      lastSync: new Date().toISOString()
    });
  } catch (error) {
    console.error('Inventory fetch error:', error);
    // Return mock data as ultimate fallback
    return NextResponse.json({
      success: true,
      data: mockInventory,
      lastSync: new Date().toISOString(),
      usingMockData: true
    });
  }
}

// POST /api/inventory - Add new inventory item
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, sku, barcode, category, price, currentStock, optimalStock, expiryDate, unit, location } = body;

    // Validate required fields
    if (!name || !sku || currentStock === undefined || optimalStock === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (name, sku, currentStock, optimalStock)' },
        { status: 400 }
      );
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('inventory')
      .insert([
        {
          sku,
          name,
          barcode: barcode || sku,
          category: category || 'Other',
          price: price || 0,
          current_stock: currentStock,
          optimal_stock: optimalStock,
          expiry_date: expiryDate || null,
          unit: unit || 'units',
          location: location || 'Warehouse',
          last_updated: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      throw error;
    }

    // Emit socket update
    emitInventoryUpdate({
      id: data.id,
      sku: data.sku,
      name: data.name,
      barcode: data.barcode,
      category: data.category,
      price: data.price,
      currentStock: data.current_stock,
      optimalStock: data.optimal_stock,
      expiryDate: data.expiry_date,
      unit: data.unit,
      lastUpdated: data.last_updated,
      location: data.location
    });

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        sku: data.sku,
        name: data.name,
        barcode: data.barcode,
        category: data.category,
        price: data.price,
        currentStock: data.current_stock,
        optimalStock: data.optimal_stock,
        expiryDate: data.expiry_date,
        unit: data.unit,
        lastUpdated: data.last_updated,
        location: data.location
      }
    });
  } catch (error: any) {
    console.error('Add inventory error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add inventory item' },
      { status: 500 }
    );
  }
}

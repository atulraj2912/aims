import { NextRequest, NextResponse } from 'next/server';

const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Get inventory data to send to Flask
    const inventoryParam = formData.get('inventory');
    
    // Create new FormData for Flask API
    const flaskFormData = new FormData();
    flaskFormData.append('file', file);
    
    if (inventoryParam) {
      flaskFormData.append('inventory', inventoryParam as string);
    }

    // Forward request to Flask API
    const response = await fetch(`${FLASK_API_URL}/api/detect`, {
      method: 'POST',
      body: flaskFormData,
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Detection failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Update Flask image URLs to proxy through Next.js
    if (data.original_image) {
      data.original_image = `${FLASK_API_URL}${data.original_image}`;
    }
    if (data.annotated_image) {
      data.annotated_image = `${FLASK_API_URL}${data.annotated_image}`;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Detection API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const response = await fetch(`${FLASK_API_URL}/health`);
    const data = await response.json();
    
    return NextResponse.json({
      status: 'healthy',
      flask_api: data,
      connected: true
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      connected: false,
      error: 'Flask API not reachable',
      flask_url: FLASK_API_URL
    }, { status: 503 });
  }
}

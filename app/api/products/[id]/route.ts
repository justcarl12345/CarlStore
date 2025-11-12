import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

// Type for the params
type Params = {
  params: {
    id: string;
  };
};

export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    await connectToDatabase();
    
    console.log('Deleting product ID from params:', params.id); // Debug log
    
    // Validate the ID format
    if (!params.id || params.id.length !== 24) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }
    
    const product = await Product.findByIdAndDelete(params.id);
    
    console.log('Found product to delete:', product); // Debug log
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Product deleted successfully' 
    });
    
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

// Keep your GET function as is
export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    await connectToDatabase();
    
    const product = await Product.findById(params.id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
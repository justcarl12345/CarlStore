import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';

// Type for the params
type Params = {
  params: {
    id: string;
  };
};

export async function PATCH(
  request: Request,
  { params }: Params
) {
  try {
    await connectToDatabase();
    
    console.log('Updating order ID:', params.id); // Debug log
    
    const body = await request.json();
    const { status } = body;

    console.log('New status:', status); // Debug log

    // Validate the ID format
    if (!params.id || params.id.length !== 24) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndUpdate(
      params.id,
      { 
        status,
        ...(status === 'completed' && { completedAt: new Date() }) // Set completedAt if status is completed
      },
      { new: true } // Return the updated document
    );

    console.log('Found and updated order:', order); // Debug log

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
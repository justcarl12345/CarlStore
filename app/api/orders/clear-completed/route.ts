import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    
    // Delete all orders with status 'completed'
    const result = await Order.deleteMany({ status: 'completed' });
    
    console.log(`Cleared ${result.deletedCount} completed orders`);
    
    return NextResponse.json({ 
      success: true,
      message: `Successfully cleared ${result.deletedCount} completed orders`,
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    console.error('Clear completed orders error:', error);
    return NextResponse.json(
      { error: 'Failed to clear completed orders' },
      { status: 500 }
    );
  }
}
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';

// GET - Get all orders
export async function GET() {
  try {
    await connectToDatabase();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST - Create new order
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const order = new Order({
      customerName: body.customerName,
      email: body.email,
      phone: body.phone,
      address: body.address,
      items: body.items,
      subtotal: body.subtotal,
      shipping: body.shipping,
      total: body.total,
      status: 'new'
    });
    
    await order.save();
    
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const { username, password } = await request.json();
    
    console.log('Creating admin user:', username);
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return NextResponse.json(
        { 
          error: 'Admin user already exists',
          existingUsername: existingAdmin.username
        },
        { status: 400 }
      );
    }
    
    // Create admin user
    const admin = new User({
      username: username.toLowerCase(),
      password: password,
      role: 'admin'
    });
    
    await admin.save();
    
    console.log('Admin user created successfully');
    
    return NextResponse.json({ 
      success: true,
      message: 'Admin user created successfully'
    });
    
  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}
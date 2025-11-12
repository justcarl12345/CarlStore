import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    // Delete all existing admin users
    await User.deleteMany({ role: 'admin' });
    
    // Create new admin user
    const admin = new User({
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });
    
    await admin.save();
    
    return NextResponse.json({ 
      success: true,
      message: 'Admin credentials reset successfully',
      credentials: {
        username: 'admin',
        password: 'admin123'
      }
    });
    
  } catch (error) {
    console.error('Reset admin error:', error);
    return NextResponse.json(
      { error: 'Failed to reset admin credentials' },
      { status: 500 }
    );
  }
}
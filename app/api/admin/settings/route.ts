import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Get the admin user (assuming there's only one admin for now)
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }
    
    // Return admin info without password
    return NextResponse.json({
      username: admin.username,
      // Don't return the password for security
    });
    
  } catch (error) {
    console.error('Get admin settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { currentUsername, newUsername, currentPassword, newPassword } = body;
    
    // Find the admin user
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }
    
    // Verify current credentials
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    if (!isCurrentPasswordValid || admin.username !== currentUsername) {
      return NextResponse.json(
        { error: 'Current username or password is incorrect' },
        { status: 400 }
      );
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (newUsername && newUsername !== currentUsername) {
      // Check if new username is available
      const existingUser = await User.findOne({ username: newUsername.toLowerCase() });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 400 }
        );
      }
      updateData.username = newUsername.toLowerCase();
    }
    
    if (newPassword) {
      updateData.password = newPassword;
    }
    
    // Update admin credentials
    const updatedAdmin = await User.findByIdAndUpdate(
      admin._id,
      updateData,
      { new: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Admin credentials updated successfully',
      username: updatedAdmin.username
    });
    
  } catch (error) {
    console.error('Update admin settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update admin settings' },
      { status: 500 }
    );
  }
}
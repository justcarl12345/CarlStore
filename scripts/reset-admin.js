const mongoose = require('mongoose');

// Your MongoDB connection string
const MONGODB_URI = 'mongodb+srv://carfred834_db_user:Carl122005@ecommerce-cluster.m6gipnv.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=ecommerce-cluster';

async function resetAdminUser() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Import the User model
    const User = require('../models/User.ts').default;
    
    // Delete any existing admin user
    console.log('🗑️ Removing existing admin users...');
    const deleteResult = await User.deleteMany({ role: 'admin' });
    console.log(`✅ Removed ${deleteResult.deletedCount} admin users`);
    
    // Create new admin user
    console.log('👤 Creating new admin user...');
    const admin = new User({
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });
    
    await admin.save();
    console.log('✅ New admin user created successfully!');
    console.log('');
    console.log('🎉 ADMIN CREDENTIALS RESET:');
    console.log('============================');
    console.log('📧 Username: admin');
    console.log('🔑 Password: admin123');
    console.log('============================');
    console.log('');
    console.log('You can now login to the admin panel with these credentials.');
    console.log('After logging in, go to Settings to change them to your preferred username/password.');
    
  } catch (error) {
    console.error('❌ Error resetting admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

resetAdminUser();
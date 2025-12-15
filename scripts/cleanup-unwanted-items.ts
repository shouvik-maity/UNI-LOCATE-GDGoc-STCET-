
import mongoose from 'mongoose';
import LostItem from '../models/LostItem';
import FoundItem from '../models/FoundItem';

// Connect to MongoDB
async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/unilocate';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Find and remove unwanted items
async function removeUnwantedItems() {
  try {
    console.log('🔍 Searching for unwanted items...');
    
    // Define the items to remove
    const itemsToRemove = [
      {
        title: 'Black Leather Wallet',
        description: 'Lost my black leather wallet containing ID, credit cards, and $50 cash near the cafeteria.',
        category: 'Accessories',
        location: 'Student Cafeteria',
        userName: 'Jane Smith',
        userEmail: 'jane@example.com'
      },
      {
        title: 'Black iPhone 14 Pro',
        description: 'Lost my black iPhone 14 Pro with a blue case in the library. It has important photos and contacts.',
        category: 'Electronics',
        location: 'University Library Building A',
        userName: 'John Doe',
        userEmail: 'john@example.com'
      }
    ];

    let removedCount = 0;

    // Check LostItem collection
    for (const item of itemsToRemove) {
      const lostItem = await LostItem.findOne({
        title: { $regex: item.title, $options: 'i' },
        description: { $regex: item.description, $options: 'i' },
        userName: item.userName
      });

      if (lostItem) {
        console.log(`🗑️ Found LostItem: ${lostItem.title} (ID: ${lostItem._id})`);
        await LostItem.findByIdAndDelete(lostItem._id);
        console.log(`✅ Removed LostItem: ${lostItem.title}`);
        removedCount++;
      }

      const foundItem = await FoundItem.findOne({
        title: { $regex: item.title, $options: 'i' },
        description: { $regex: item.description, $options: 'i' },
        userName: item.userName
      });

      if (foundItem) {
        console.log(`🗑️ Found FoundItem: ${foundItem.title} (ID: ${foundItem._id})`);
        await FoundItem.findByIdAndDelete(foundItem._id);
        console.log(`✅ Removed FoundItem: ${foundItem.title}`);
        removedCount++;
      }
    }

    // Also search for partial matches to catch any variations
    const partialSearches = [
      { searchTerm: 'Black Leather Wallet', type: 'wallet' },
      { searchTerm: 'Black iPhone 14 Pro', type: 'iphone' }
    ];

    for (const search of partialSearches) {
      const lostItems = await LostItem.find({
        $or: [
          { title: { $regex: search.searchTerm, $options: 'i' } },
          { description: { $regex: search.searchTerm, $options: 'i' } }
        ]
      });

      for (const item of lostItems) {
        console.log(`🗑️ Found partial LostItem match: ${item.title} (ID: ${item._id})`);
        await LostItem.findByIdAndDelete(item._id);
        console.log(`✅ Removed partial LostItem: ${item.title}`);
        removedCount++;
      }

      const foundItems = await FoundItem.find({
        $or: [
          { title: { $regex: search.searchTerm, $options: 'i' } },
          { description: { $regex: search.searchTerm, $options: 'i' } }
        ]
      });

      for (const item of foundItems) {
        console.log(`🗑️ Found partial FoundItem match: ${item.title} (ID: ${item._id})`);
        await FoundItem.findByIdAndDelete(item._id);
        console.log(`✅ Removed partial FoundItem: ${item.title}`);
        removedCount++;
      }
    }

    console.log(`\n🎉 Cleanup completed! Removed ${removedCount} items total.`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Main execution
async function main() {
  await connectDB();
  await removeUnwantedItems();
  await mongoose.connection.close();
  console.log('🔒 Database connection closed');
}

main();

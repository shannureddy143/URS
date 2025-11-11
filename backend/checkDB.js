const mongoose = require('mongoose');
const User = require('./models/User');

async function checkDB() {
  try {
    await mongoose.connect('mongodb+srv://palisettysanjaykumar_db_user:StPcfumQIOvDAEtS@urs.h9jrkne.mongodb.net/demo');
    
    const users = await User.find({});
    console.log('Users in database:', users.length);
    users.forEach(user => console.log('- Email:', user.email));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDB();
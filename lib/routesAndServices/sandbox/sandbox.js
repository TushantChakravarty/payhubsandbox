const { MongoClient } = require('mongodb');


function addMerchant(details) {
  const dbUrl = 'mongodb+srv://payhub:GBA97ISU6itkVmzM@cluster0.omnvtd0.mongodb.net/?retryWrites=true&w=majority';

  // Create a new MongoClient instance
  const client = new MongoClient(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

  // Connect to the MongoDB server
  client.connect(async (err) => {
      if (err) {
          console.error('Error connecting to MongoDB:', err);
          //callback(err);
      } else {
          console.log('Connected to MongoDB');
        //   const users = await adminDao.getUserDetails({
        //     emailId:'samir123@payhub'
        //   })
          //console.log(users)
          // Access the database and collection here, if needed
          const db = client.db();
          const collection = db.collection('users');
          const result = await collection.insertOne(details)

          console.log(`${result.insertedCount} user inserted successfully.`);
          //console.log('Connected to sandbox', users);

          // Pass the client instance to the callback
          //callback(null, client);
      }
  });
}

module.exports ={
    addMerchant
}
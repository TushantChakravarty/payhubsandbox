"use strict";

console.log("");
console.log("//API SANDWICH BACKEND//");
console.log("");
require("dotenv").config();
var res = require("dotenv").config();
const cron = require("node-cron");
const config = require("./lib/config");
const { myFunction, updateAdmin } = require("./lib/user/scheduler/scheduler");
const adminDao = require("./lib/user/adminDao");
const { getTransactionsSummaryYesterday } = require("./lib/user/transactionsDao/TransactionDao");
const { MongoClient } = require('mongodb');
const { getAllUsers } = require("./lib/user/userDao");



cron.schedule("0 30 18 * * *", async () => {
  // Get the last execution date from the file
  const admin = await adminDao.getUserDetails({
    emailId: "samir123@payhub",
  });
  const lastExecutionDate = admin.lastExecutionDate;

  // Get the current date
  const currentDate = new Date().toISOString().split("T")[0];

  // Check if the function has not been executed today
  if (lastExecutionDate !== currentDate) {
    // Run your function
    myFunction();
    console.log("running");

    // Update the last execution date in the file
    //fs.writeFileSync(DATE_FILE, currentDate);
    const update = {
      lastExecutionDate: currentDate,
    };
    adminDao.updateProfile(
      {
        emailId: "samir123@payhub",
      },
      update
    );
  }
});

cron.schedule("*/60 * * * *", async () => {
  await adminDao.updateVolumeData("success");
  await adminDao.getTotalVolume("success");
  await adminDao.updateGatewayVolumeData();
});


cron.schedule("*/30 * * * *", async () => {
  await adminDao.updateTotalGatewayBalance();
  await adminDao.updateBalanceMerchants()
  await adminDao.updateBalanceAdmin()
});

//getTransactionsSummaryYesterday()

// function connectDb() {
//   const dbUrl = 'mongodb+srv://payhub:GBA97ISU6itkVmzM@cluster0.omnvtd0.mongodb.net/?retryWrites=true&w=majority';

//   // Create a new MongoClient instance
//   const client = new MongoClient(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

//   // Connect to the MongoDB server
//   client.connect(async (err) => {
//       if (err) {
//           console.error('Error connecting to MongoDB:', err);
//           //callback(err);
//       } else {
//           console.log('Connected to MongoDB');
//           const users = await adminDao.getUserDetails({
//             emailId:'samir123@payhub'
//           })
//           //console.log(users)
//           // Access the database and collection here, if needed
//           const db = client.db();
//           const collection = db.collection('admin');
//           //const result = await collection.insertMany([users]);

//           //console.log(`${result.insertedCount} users inserted successfully.`);
//           //console.log('Connected to sandbox', users);

//           // Pass the client instance to the callback
//           //callback(null, client);
//       }
//   });
// }

// connectDb()
config.dbConfig((err) => {
  if (err) {
    // logger.error(err, 'exiting the app.');

    console.log({ err });
    return;
  }

  // load external modules
  const express = require("express");

  // init express app
  const app = express();
  app.set('trust proxy', true)

  // config express
  config.expressConfig(app);
  if (err) return res.json(err);

  // attach the routes to the app
  require("./lib/routes")(app);

  const port = process.env.PORT || 2000; // start server
  const server = app.listen(port, () => {
    console.log(`Express server listening on ${port}`);
    // logger.info(`Express server listening on ${config.cfg.port}, in ${config.cfg.TAG} mode`);
  });
});
/**
 * 
 * "email": "tushant029",
        "password": "85ihqtkzgiznoaxtfy8a",
        "apiKey": "uhj10xf4gad"
 * 
 * "emailId": "tushantxyzz",
    "apiKey": "q34uc0r7ny"

    admin credential
    
 "email": "samir@payhub",
        "password": " mkali126",
        "apiKey": "eje92rqgxbf"


         "email": "tushant2909@gmail.com",
        "password": "62pmjrgbl97uvlxer8kh",
        "apiKey": "1iqj733f3xt"

        "email": "samir123@payhub",
        "password": "8s5ozglbdxpo7vupqpg1",
        "apiKey": "dk3lonopa4i"

250955
        user

         email: 'jonty128@gmail.com',
  password: '7kjvytthm1tfwv2npkoj',
  apiKey: 'U2FsdGVkX1/pe02WKy2VrritbExuKdW/zyjTYJ0PJiE='

   "email": "tushant2907@gmail.com",
        "password": "tushant2907",
        "apiKey": "U2FsdGVkX19nJYUKRmoF3i/7Q/g8kKovBQ78miTfsI4="

        Email id: tushant29089@gmail.com
Password: flejoi2fc3rqn5t874ch
Apikey: U2FsdGVkX18jB5Et3CNmzR8q5Zdrz3cHixHyUyGdUYs=


Email id: jontyrhodes@gmail
Password: 4do5vx514f56jxv7kkd1
Apikey: U2FsdGVkX19MkOae7dB35cg6hDpxjBmEWQvp4ghodSg=
 */

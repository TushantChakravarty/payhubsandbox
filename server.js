"use strict";

console.log("");
console.log("//API SANDWICH BACKEND//");
console.log("");
require("dotenv").config();
var res = require("dotenv").config();
const cron = require("node-cron");
const config = require("./lib/config");
const {
  myFunction,
  updateAdmin,
  updateAdminYesterdayTx,
} = require("./lib/routesAndServices/scheduler/scheduler");
const adminDao = require("./lib/routesAndServices/admin/adminDao");
const {
  getTransactionsSummaryYesterday,
} = require("./lib/routesAndServices/transactionsDao/TransactionDao");
const { MongoClient } = require("mongodb");
const { getAllUsers } = require("./lib/routesAndServices/user/userDao");
const {
  updatePendingTransactionStatus,
} = require("./lib/routesAndServices/scheduler/statusScheduler");
const {
  updateVolumeDataPayouts,
  getTotalAdminVolumePayouts,
  updatePayoutsBalanceMerchants,
} = require("./lib/routesAndServices/payouts/payoutsDao");
// const { getAllPendinTransactionsPaythrough } = require("./lib/controllers/paythrough");
// const { updatePendingTransactionStatus } = require("./lib/user/scheduler/statusScheduler");

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
    updateAdmin();
    updateAdminYesterdayTx();
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
cron.schedule("0 40 18 * * *", async () => {
  updateAdminYesterdayTx();
});
//updateAdminYesterdayTx()
// Runs every 5 hours
cron.schedule("0 */5 * * *", async () => {
  await adminDao.updateVolumeData("success");
  await adminDao.getTotalVolume("success");
  await adminDao.updateGatewayVolumeData();
  await updateVolumeDataPayouts("success");
  await getTotalAdminVolumePayouts("success");
});

// Runs every 6 hours
cron.schedule("0 */6 * * *", async () => {
  await adminDao.updateTotalGatewayBalance();
  await adminDao.updateBalanceMerchants();
  await adminDao.updateBalanceAdmin();
});

//updatePayoutsBalanceMerchants()
// cron.schedule("40 */2 * * *", async () => {
//   updatePendingTransactionStatus();
// });


//getTransactionsSummaryYesterday()

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
  app.set("trust proxy", true);

  // config express
  config.expressConfig(app);
  if (err) return res.json(err);

  // attach the routes to the app
  require("./lib/routes")(app);

  const port = process.env.PORT || 2000; // start server
 app.listen(port, () => {
    console.log(`Express server listening on ${port}`);
    // logger.info(`Express server listening on ${config.cfg.port}, in ${config.cfg.TAG} mode`);
  });
});

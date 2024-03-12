const mongoose = require("mongoose");
let BaseDao = require("../dao/BaseDao");
const constants = require("../constants");

const Admin = require("../generic/models/adminModel");
const user = require("../generic/models/userModel");
const adminDao = new BaseDao(Admin);
const usrDao = new BaseDao(user);
const dao = require("./userDao");
const { Transaction } = require('../generic/models/TransactionData'); // Adjust the path accordingly


const moment = require("moment-timezone");
const { getAllTransactionsData, getAllMerchantTransactions } = require("./transactionDao");

/*#################################            Load modules end            ########################################### */

/**
 * Get user details
 * @param {Object} query query to find user details
 */
function getUserDetails(query) {
  return adminDao.findOne(query);
}

function getMerchantDetails(query) {
  return usrDao.findOne(query);
}

/**
 * Create user
 * @param {Object} obj user details to be registered
 */
function createUser(obj) {
  let userObj = new Admin(obj);
  return adminDao.save(userObj);
}

/**
 * Update user profile
 * @param {Object} query mongo query to find user to update
 * @param {Object} updateDetails details to be updated
 */
function updateProfile(query, updateDetails) {
  let update = {};
  update["$set"] = updateDetails;

  let options = {
    new: true,
  };

  return adminDao.findOneAndUpdate(query, update, options);
}

function updateUserProfile(query, updateDetails) {
  let update = {};
  update["$set"] = updateDetails;

  let options = {
    new: true,
  };

  return usrDao.findOneAndUpdate(query, update, options);
}

function updateUserGateway(query, updateDetails) {
  let update = {};
  update["$set"] = updateDetails;

  let options = {
    new: true,
  };

  return usrDao.findOneAndUpdate(query, update, options);
}

async function updateUserProfile2(details, updateDetails) {
  const transactionData = await Transaction.findOne({
    "transactionId": details.transactionId
  });

  if (!transactionData) {
    throw new Error('Transaction not found');
  }

  const userId = transactionData.uuid;

  // const userData = await usrDao.findOne({
  //   _id: userId
  // });

  // if (!userData) {
  //   throw new Error('User not found');
  // }

  //console.log('User UUID:', userData);
  const filter = {
    _id: userId
  };
  let update = {};
  update["$set"] = updateDetails;

  let options = {
    new: true,
  };

  return usrDao.findOneAndUpdate(filter, update, options);
}

async function updateGatewayDetails(gatewayName, updateDetails) {
  try {
    const filter = {
      "gateways.gatewayName": gatewayName,
    };

    const update = {
      $set: {
        "gateways.$.last24hr": updateDetails.last24hr,
        "gateways.$.last24hrSuccess": updateDetails.last24hrSuccess,
        "gateways.$.totalVolume": updateDetails.totalVolume,
        "gateways.$.feeCollected24hr": updateDetails.feeCollected24hr,
        "gateways.$.successfulTransactions":
          updateDetails.successfulTransactions,
        "gateways.$.totalFeeCollected": updateDetails.totalFeeCollected,
        // Add other fields to update here
      },
    };

    const options = {
      new: true,
    };

    const updatedDoc = await adminDao.findOneAndUpdate(filter, update, options);

    if (updatedDoc) {
      // console.log("Gateway details updated:", updatedDoc);
      return updatedDoc;
    } else {
      console.log("Gateway not found or update failed.");
      return null;
    }
  } catch (error) {
    console.error("Error updating gateway details:", error);
    throw error; // You can handle the error as needed
  }
}

async function updateGateway(gatewayName, updateDetails) {
  try {
    const filter = {
      "gateways.gatewayName": gatewayName,
    };

    const update = {
      $set: {
        "gateways.$.last24hr": 0,
        "gateways.$.last24hrSuccess": 0,
        "gateways.$.yesterday": updateDetails.yesterday,
        "gateways.$.feeCollected24hr": 0,
        "gateways.$.feeCollected24hr": 0,
        "gateways.$.yesterdayFee": updateDetails.yesterdayFee,
        "gateways.$.yesterdayTransactions": updateDetails.yesterdayTransactions,
        "gateways.$.last24hrTotal": 0,

        // Add other fields to update here
      },
    };

    const options = {
      new: true,
    };

    const updatedDoc = await adminDao.findOneAndUpdate(filter, update, options);

    if (updatedDoc) {
      console.log("Gateway details updated:", updatedDoc);
      return updatedDoc;
    } else {
      console.log("Gateway not found or update failed.");
      return null;
    }
  } catch (error) {
    console.error("Error updating gateway details:", error);
    throw error; // You can handle the error as needed
  }
}

async function updateGateway24(gatewayName, updateDetails) {
  try {
    const filter = {
      "gateways.gatewayName": gatewayName,
    };

    const update = {
      $set: {
        "gateways.$.last24hr": updateDetails.last24hr,
      },
    };

    const options = {
      new: true,
    };

    const updatedDoc = await adminDao.findOneAndUpdate(filter, update, options);

    if (updatedDoc) {
      //console.log('Gateway details updated:', updatedDoc);
      return updatedDoc;
    } else {
      console.log("Gateway not found or update failed.");
      return null;
    }
  } catch (error) {
    console.error("Error updating gateway details:", error);
    throw error; // You can handle the error as needed
  }
}

async function updateGatewaySwitch(gatewayName, updateDetails) {
  try {
    const filter = {
      "gateways.gatewayName": gatewayName,
    };

    const update = {
      $set: {
        "gateways.$.switch": updateDetails.switch,
      },
    };

    const options = {
      new: true,
    };

    const updatedDoc = await adminDao.findOneAndUpdate(filter, update, options);

    if (updatedDoc) {
      //console.log('Gateway details updated:', updatedDoc);
      return updatedDoc;
    } else {
      console.log("Gateway not found or update failed.");
      return null;
    }
  } catch (error) {
    console.error("Error updating gateway details:", error);
    throw error; // You can handle the error as needed
  }
}

async function updateGatewayBalance(gatewayName, updateDetails) {
  try {
    const filter = {
      "gateways.gatewayName": gatewayName,
    };

    const update = {
      $set: {
        "gateways.$.balance": updateDetails.balance,
      },
    };

    const options = {
      new: true,
    };

    const updatedDoc = await adminDao.findOneAndUpdate(filter, update, options);

    if (updatedDoc) {
      //console.log('Gateway details updated:', updatedDoc);
      return updatedDoc;
    } else {
      console.log("Gateway not found or update failed.");
      return null;
    }
  } catch (error) {
    console.error("Error updating gateway details:", error);
    throw error; // You can handle the error as needed
  }
}

async function updateGatewaySettlementsAndBalance(gatewayName, updateDetails) {
  try {
    const filter = {
      "gateways.gatewayName": gatewayName,
    };

    const update = {
      $set: {
        "gateways.$.settlements": updateDetails.settlements,
        "gateways.$.balance": updateDetails.balance,
      },
    };

    const options = {
      new: true,
    };

    const updatedDoc = await adminDao.findOneAndUpdate(filter, update, options);

    if (updatedDoc) {
      //console.log('Gateway details updated:', updatedDoc);
      return updatedDoc;
    } else {
      console.log("Gateway not found or update failed.");
      return null;
    }
  } catch (error) {
    console.error("Error updating gateway details:", error);
    throw error; // You can handle the error as needed
  }
}

async function updateGatewayDetailsPayin(gatewayName, updateDetails) {
  try {
    const filter = {
      "gateways.gatewayName": gatewayName,
    };

    const update = {
      $set: {
        "gateways.$.last24hrTotal": updateDetails.last24hrTotal,
        "gateways.$.totalTransactions": updateDetails.totalTransactions,
        // Add other fields to update here
      },
    };

    const options = {
      new: true,
    };

    const updatedDoc = await adminDao.findOneAndUpdate(filter, update, options);

    if (updatedDoc) {
      // console.log("Gateway details updated:", updatedDoc);
      return updatedDoc;
    } else {
      console.log("Gateway not found or update failed.");
      return null;
    }
  } catch (error) {
    console.error("Error updating gateway details:", error);
    throw error; // You can handle the error as needed
  }
}

async function updateGatewayCollectionFee(gatewayName, updateDetails) {
  try {
    const filter = {
      "gateways.gatewayName": gatewayName,
    };

    const update = {
      $set: {
        "gateways.$.collectionFee": updateDetails.collectionFee,
        // Add other fields to update here
      },
    };

    const options = {
      new: true,
    };

    const updatedDoc = await adminDao.findOneAndUpdate(filter, update, options);

    if (updatedDoc) {
      console.log("Gateway details updated:", updatedDoc);
      return updatedDoc;
    } else {
      console.log("Gateway not found or update failed.");
      return null;
    }
  } catch (error) {
    console.error("Error updating gateway details:", error);
    throw error; // You can handle the error as needed
  }
}

async function updateGatewayFees(gatewayName, updateDetails) {
  try {
    const filter = {
      "gateways.gatewayName": gatewayName,
    };

    const update = {
      $set: {
        "gateways.$.collectionFee": updateDetails.collectionFee,
        "gateways.$.payoutFee": updateDetails.payoutFee,

        // Add other fields to update here
      },
    };

    const options = {
      new: true,
    };

    const updatedDoc = await adminDao.findOneAndUpdate(filter, update, options);

    if (updatedDoc) {
      console.log("Gateway details updated:", updatedDoc);
      return updatedDoc;
    } else {
      console.log("Gateway not found or update failed.");
      return null;
    }
  } catch (error) {
    console.error("Error updating gateway details:", error);
    throw error; // You can handle the error as needed
  }
}

async function updateGatewayPayoutFee(gatewayName, updateDetails) {
  try {
    const filter = {
      "gateways.gatewayName": gatewayName,
    };

    const update = {
      $set: {
        "gateways.$.payoutFee": updateDetails.payoutFee,
        // Add other fields to update here
      },
    };

    const options = {
      new: true,
    };

    const updatedDoc = await adminDao.findOneAndUpdate(filter, update, options);

    if (updatedDoc) {
      console.log("Gateway details updated:", updatedDoc);
      return updatedDoc;
    } else {
      console.log("Gateway not found or update failed.");
      return null;
    }
  } catch (error) {
    console.error("Error updating gateway details:", error);
    throw error; // You can handle the error as needed
  }
}
// async function updateWallet(query, updateDetails) {

//     let update = {}
//     update['$push'] = updateDetails

//     let options = {
//         new: true
//     }

//     return usrDao.findOneAndUpdate(query, {$push:{accounts:updateDetails}},{safe: true, upsert: true, new : true})

// }

// async function updateTransaction(query, updateDetails) {

//     let update = {}
//     update['$push'] = updateDetails

//     let options = {
//         new: true
//     }

//     return usrDao.findOneAndUpdate(query, {$push:{transactions:updateDetails}},{safe: true, upsert: true, new : true})

// }

// async function getAllWallets(details){
//   const data = await usrDao.findOne(details)
//   //console.log(data)
//   return data
// }

async function getAllTransactions(details) {
  const data = await adminDao.findOne(details);
  //console.log(data)
  return data;
}

async function getUser(details) {
  const data = await usrDao.findOne(details);
  //console.log(data)
  return data;
}

async function getAllUserTransactions(details) {
  const data = await usrDao.findOne(details);
  //console.log(data)
  return data;
}
async function getUserBalance(details) {
  const data = await usrDao.findOne(details);
  //console.log(data)
  return data;
}
async function getUserBalance2(details) {
  const transactionData = await Transaction.findOne({
    "transactionId": details.transactionId
  });

  if (!transactionData) {
    throw new Error('Transaction not found');
  }

  const userId = transactionData.uuid;

  const userData = await usrDao.findOne({
    _id: userId
  });

  if (!userData) {
    throw new Error('User not found');
  }

  //console.log('User UUID:', userData);

  return [userData];

}
async function getAllUsersTransactions() {
  const data = await usrDao.find();
  //console.log(data)
  return data;
}
async function fetchTxDetail() {
  const user = await usrDao.findOne(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Find the transaction by its ID and update it
  const transaction = user.transactions.find(
    (t) => t.transactionId.toString() === transactionId.toString()
  );
  if (!transaction) {
    throw new Error("Transaction not found");
  }

  // Update the transaction data
  //console.log(transaction)
  return transaction;
}
async function updateTransactionData(userId, transactionId, updateData) {
  const user = await usrDao.findOne(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Find the transaction by its ID and update it
  const transaction = user.transactions.find(
    (t) => t.transactionId.toString() === transactionId.toString()
  );
  if (!transaction) {
    throw new Error("Transaction not found");
  }

  // Update the transaction data
  Object.assign(transaction, updateData);

  // Save the updated user document
  const response = await user.save();
  return response;
}
async function updateTransactions(userId, transactionId, updateData) {
  const user = await usrDao.find({
    transactions: {
      $elemMatch: { transactionId: transactionId },
    },
  });
  // console.log(transactionId)
  // console.log('user',user)
  if (!user) {
    throw new Error("User not found");
  }

  // Find the transaction by its ID and update it
  const transaction = await user[0].transactions.find(
    (t) => t.transactionId === transactionId
  );
  // console.log(transaction)
  if (!transaction) {
    throw new Error("Transaction not found");
  }

  // Update the transaction data
  Object.assign(transaction, updateData);

  // Save the updated user document
  const response = await user[0].save();
  return response;
}
const getTransactionDetails = async (transactionId) => {
  const user = await usrDao.find({
    transactions: {
      $elemMatch: { transactionId: transactionId },
    },
  });
  //console.log(transactionId)
  //console.log('user',user)
  if (!user) {
    throw new Error("User not found");
  }

  // Find the transaction by its ID and update it
  const transaction = await user[0].transactions.find(
    (t) => t.transactionId === transactionId
  );
  // console.log(transaction)
  if (!transaction) {
    throw new Error("Transaction not found");
  }
  return transaction;
};

const getGatewayDetails = async (gatewayName) => {
  const user = await adminDao.find({
    gateways: {
      $elemMatch: { gatewayName: gatewayName },
    },
  });

  //console.log('user',user)
  if (!user) {
    throw new Error("User not found");
  }

  // Find the transaction by its ID and update it
  const gateway = await user[0].gateways.find(
    (t) => t.gatewayName === gatewayName
  );
  // console.log(transaction)
  if (!gateway) {
    throw new Error("Transaction not found");
  }
  return gateway;
};
async function updateSettlement(query, updateDetails) {
  let update = {};
  update["$push"] = updateDetails;

  let options = {
    new: true,
  };

  return usrDao.findOneAndUpdate(
    query,
    { $push: { settlements: updateDetails } },
    { safe: true, upsert: true, new: true }
  );
}

async function updateGatewayData(query, updateDetails) {
  let update = {};
  update["$push"] = updateDetails;

  let options = {
    new: true,
  };

  return adminDao.findOneAndUpdate(
    query,
    { $push: { gateways: updateDetails } },
    { safe: true, upsert: true, new: true }
  );
}
// function getWalletdetail(query){

//     return usrDao.Find({
//         $and: [
//             { "_id": { $ne: `${query._id}` } },
//           { "walletAddress":`${query.walletAddress}`} ,

//         ]
//       })
// }

async function getUserTransactionsData(details) {
  try {
    const query = {
      emailId: details.emailId,
    };

    const user = await usrDao.findOne(query);

    if (!user) {
      return null; // User not found
    }

    const uuid = String(user._id);

    const transactions = await Transaction.aggregate([
      {
        $match: {
          uuid: uuid,
        },
      },
      {
        $sort: { "transaction_date": -1 },
      },
      {
        $skip: details.skip,
      },
      {
        $limit: details.limit,
      },
    ]);

    return transactions ? transactions : [];
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

async function getTransactionsByStatus(details) {
  try {
    let query = {
      emailId: details.emailId,
    };

    const user = await usrDao.findOne(query);

    if (!user) {
      return null; // User not found
    }

    const uuid = String(user._id);

    const transactions = await Transaction.aggregate([
      {
        $match: {
          uuid: String(uuid),
          status: details?.status,
        },
      },
      {
        $sort: { "transaction_date": -1 },
      },
      {
        $skip: details?.skip || 0,
      },
      {
        $limit: details?.limit || 0,
      },
    ]);

    return transactions || [];
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

async function updateTransaction(query, updateDetails) {
  let update = {};
  update["$push"] = updateDetails;

  let options = {
    new: true,
  };

  return adminDao.findOneAndUpdate(
    query,
    { $push: { transactions: updateDetails } },
    { safe: true, upsert: true, new: true }
  );
}

// async function getTransactionByDate(userId, startDate, endDate) {
//   const user = await usrDao.findOne(userId);
//   if (!user) {
//     throw new Error("User not found");
//   }

//   // Parse the input dates using moment and set the timezone to IST
//   const startDateTime = moment(startDate).startOf('day').tz('Asia/Kolkata');
//   const endDateTime = moment(endDate).endOf('day').tz('Asia/Kolkata');

//   // Debug: Check the parsed moment objects with IST timezone
//   console.log("Parsed moment objects in IST:", startDateTime.toString(), endDateTime.toString());

//   // Filter transactions within the date range
//   const transactions = user.transactions.filter((t) => {
//     const transactionDate = moment(t.transaction_date).tz('Asia/Kolkata');

//     // Debug: Check the transaction date in IST
//     // console.log('Transaction date in IST:', transactionDate.toString());

//     // Perform date comparison
//     return transactionDate.isSameOrAfter(startDateTime) && transactionDate.isSameOrBefore(endDateTime);
//   });

//   if (transactions.length === 0) {
//     throw new Error("No transactions found within the specified date range");
//   }

//   return transactions;
// }

async function getTransactionByDate(emailId, startDate, endDate) {
  try {
    // Find the user by emailId and retrieve the ObjectId
    const user = await usrDao.findOne(emailId);
    if (!user) {
      throw new Error("User not found");
    }
    const userId = user._id;
    console.log(userId);

    // Parse the input dates using moment and set the timezone to IST
    const startDateTime = moment.tz(startDate, 'Asia/Kolkata').startOf('day').toISOString();
    const endDateTime = moment.tz(endDate, 'Asia/Kolkata').endOf('day').toISOString();

    // Debug: Check the parsed moment objects with IST timezone
    console.log("Parsed moment objects in IST:", startDateTime.toString(), endDateTime.toString());

    // Aggregate pipeline to filter transactions within the date range using Transaction model
    const transactions = await Transaction.aggregate([
      {
        $match: {
          uuid: String(userId),
          "transaction_date": { $gte: startDateTime, $lte: endDateTime }
        },
      },
    ]);

    if (transactions.length === 0) {
      throw new Error("No transactions found within the specified date range");
    }

    return transactions;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}



async function getTransactionByDateWithStatus(userId, startDate, endDate, status) {
  try {
    // Find the user by userId and retrieve the ObjectId
    const user = await usrDao.findOne(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const userIdObj = user._id;
    console.log(userIdObj);

    // Parse the input dates using moment and set the timezone to IST
    const startDateTime = moment(startDate).startOf('day').tz('Asia/Kolkata').toISOString();
    const endDateTime = moment(endDate).endOf('day').tz('Asia/Kolkata').toISOString();

    // Debug: Check the parsed moment objects with IST timezone
    console.log("Parsed moment objects in IST:", startDateTime.toString(), endDateTime.toString());

    // Aggregate pipeline to filter transactions within the date range and with the specified status
    const transactions = await Transaction.aggregate([
      {
        $match: {
          uuid: String(userIdObj),
          "transaction_date": { $gte: startDateTime, $lte: endDateTime },
          "status": status
        },
      },
    ]);

    if (transactions.length === 0) {
      throw new Error("No transactions found within the specified date range and status");
    }

    return transactions;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}


async function getAllTransactionByDate(startDate, endDate) {
  const users = await usrDao.find();
  if (!users) {
    throw new Error("User not found");
  }

  // Parse the input dates using moment and set the timezone to IST
  const startDateTime = moment(startDate).startOf('day').tz('Asia/Kolkata');
  const endDateTime = moment(endDate).endOf('day').tz('Asia/Kolkata');

  // Debug: Check the parsed moment objects with IST timezone
  console.log("Parsed moment objects in IST:", startDateTime.toString(), endDateTime.toString());


  const transactions = await getAllMerchantTransactions()

  const userTransactions = transactions.filter((t) => {
    const transactionDate = moment(t.transaction_date).tz('Asia/Kolkata');

    // Perform date comparison
    return transactionDate.isSameOrAfter(startDateTime) && transactionDate.isSameOrBefore(endDateTime);
  });



  if (userTransactions.length === 0) {
    throw new Error("No transactions found within the specified date range");
  }

  return userTransactions;
}
async function getAllTransactionByDateWithStatus(startDate, endDate, status) {
  const users = await usrDao.find();
  if (!users) {
    throw new Error("User not found");
  }

  // Parse the input dates using moment and set the timezone to IST
  const startDateTime = moment(startDate).startOf('day').tz('Asia/Kolkata');
  const endDateTime = moment(endDate).endOf('day').tz('Asia/Kolkata');

  // Debug: Check the parsed moment objects with IST timezone
  console.log("Parsed moment objects in IST:", startDateTime.toString(), endDateTime.toString());

  const transactions = [];

  // Create a map to convert hash values to gateway names
  const hashToGateway = {
    xyzAirpay: "airpay",
    xyzPaythrough: "paythrough",
    xyzbazorpay: "bazarpay",
    xyzSwipeline: "swipeline",
    // Add more mappings as needed
  };

  users.forEach((user) => {
    const userTransactions = user.transactions.filter((t) => {
      // Convert transaction date to IST
      const transactionDate = moment(t.transaction_date).tz('Asia/Kolkata');

      // Perform date and status comparison
      return (
        transactionDate.isSameOrAfter(startDateTime) &&
        transactionDate.isSameOrBefore(endDateTime) &&
        status == t.status
      );
    });

    // Map and push the user's transactions to the main transactions array
    userTransactions.forEach((item) => {
      const gateway = hashToGateway[item.hash] || "";
      transactions.push({
        transactionId: item.transactionId,
        merchant_ref_no: item.merchant_ref_no,
        amount: item.amount,
        currency: item.currency, // Fix the typo: 'currency' not 'curreny'
        country: item.country,
        status: item.status,
        hash: item.hash,
        payout_type: item.payout_type,
        message: item.message,
        utr: item.utr ? item.utr : "",
        transaction_date: moment(item.transaction_date).tz('Asia/Kolkata').format(), // Convert to IST and format
        business_name: user.business_name,
        gateway: item.gateway ? item.gateway : gateway
      });
    });
  });

  if (transactions.length === 0) {
    throw new Error("No transactions found within the specified date range and status");
  }

  return transactions;
}


async function getAllTransactionWithStatus(status, details) {
  //console.log(status)
  // const Users = await usrDao.find();
  // //console.log('running here',Users)
  // if (!Users) {
  //   throw new Error("User not found");
  // }

  // Find the transaction by date and update it
  // console.log('Input dates:', startDate, endDate);

  // Parse the input dates into Date objects

  // Filter transactions within the date range
  const transactions = [];

  // Create a map to convert hash values to gateway names
  const hashToGateway = {
    xyzAirpay: "airpay",
    xyzPaythrough: "paythrough",
    xyzbazorpay: "bazarpay",
    xyzSwipeline: "swipeline",
    // Add more mappings as needed
  };

  // Convert startDateTime and endDateTime to Date objects outside the loop

  const Transactions = await getAllTransactionsData(details.limit, details.skip, status)

  // const userTransactions = Transactions.filter((t) => {
  //   // Perform date comparison
  //   return status == t.status;
  // });
  //const paginated = userTransactions.slice(details.skip, details.skip + details.limit);

  // Map and push the user's transactions to the main transactions array


  // if (Transactions.length === 0) {
  //   throw new Error("No transactions found within the specified date range");
  // }
  // const paginated = userTransactions.slice(
  //   details.skip,
  //   details.skip + details.limit
  // );

  return Transactions;
}

async function getAllTransactionWithPendingStatus(status) {
  const Users = await usrDao.find();
  //console.log('running here',Users)
  if (!Users) {
    throw new Error("User not found");
  }

  // Find the transaction by date and update it
  // console.log('Input dates:', startDate, endDate);

  // Parse the input dates into Date objects

  // Filter transactions within the date range
  const transactions = [];

  // Create a map to convert hash values to gateway names
  const hashToGateway = {
    xyzAirpay: "airpay",
    xyzPaythrough: "paythrough",
    xyzbazorpay: "bazarpay",
    xyzSwipeline: "swipeline",
    // Add more mappings as needed
  };

  // Convert startDateTime and endDateTime to Date objects outside the loop

  Users.forEach((user) => {
    const userTransactions = user.transactions.reverse().filter((t) => {
      // Perform date comparison
      return status == t.status && t.hash == "xyzSwipeline";
    });
    //const paginated = userTransactions.slice(details.skip, details.skip + details.limit);

    // Map and push the user's transactions to the main transactions array
    userTransactions.forEach((item) => {
      const gateway = hashToGateway[item.hash] || "";
      transactions.push({
        transactionId: item.transactionId,
        merchant_ref_no: item.merchant_ref_no,
        amount: item.amount,
        currency: item.currency, // Fix the typo: 'currency' not 'curreny'
        country: item.country,
        status: item.status,
        hash: item.hash,
        payout_type: item.payout_type,
        message: item.message,
        utr: item.utr ? item.utr : "",
        transaction_date: item.transaction_date,
        business_name: user.business_name,
        gateway: item.gateway ? item.gateway : gateway,
      });
    });
  });

  if (transactions.length === 0) {
    throw new Error("No transactions found within the specified date range");
  }
  const paginated = transactions;

  return paginated;
}
async function getAllTransactionWithSuccessStatus(data, details) {
  try {
    let query = {
      emailId: data
    };

    // console.log(details);

    const user = await usrDao.findOne(query);

    if (!user) {
      throw new Error('User not found');
    }
    // Assuming the user model has a field 'uuid' that represents the user identifier
    const userId = String(user._id)
    console.log("user", userId)

    const userTransactions = await Transaction.aggregate([
      {
        $match: { uuid: userId, "status": 'success' }
      },
      {
        $sort: { "transaction_date": 1 } // Sort transactions by date in ascending order
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: { $toDate: "$transaction_date" },
              timezone: "Asia/Kolkata"
            }
          },
          volume: { $sum: "$amount" },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $project: {
          date: "$_id",
          volume: 1,
          transactionCount: 1,
          _id: 0
        }
      }
    ]);
    let paginated = userTransactions.sort((a, b) => moment(b.date, 'YYYY-MM-DD') - moment(a.date, 'YYYY-MM-DD'));
    paginated = paginated.slice(details.skip, details.skip + details.limit);


    if (paginated.length === 0) {
      console.log('No transactions found with the specified status');
    }

    return paginated;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

async function getTotalVolumeAndSettlements(emailId) {
  let query = {
    emailId,
  };
  const User = await usrDao.findOne(query);

  if (!User) {
    throw new Error("User not found");
  }

  //const aggregatedTransactions = new Map();
  let totalVolume = 0;
  let totalSettlements = 0;
  const userTransactions = await Transaction.aggregate([
    {
      $match: {
        "uuid": String(User?._id),
        "status": 'success',
      },
    },
    {
      $group: {
        _id: null,
        totalVolume: { $sum: "$amount" },
      },
    },
  ]);
  //console.log(userTransactions[0].totalVolume);

  const userSettlements = User.settlements;
  // userTransactions.forEach((item) => {
  //   totalVolume = totalVolume + item.amount;
  // });

  userSettlements.forEach((item) => {
    totalSettlements = totalSettlements + item.amount;
  });

  return { totalVolume: userTransactions[0]?.totalVolume ? userTransactions[0]?.totalVolume : 0, totalSettlements };
}

async function getTotalGatewayVolume(emailId) {
  let query = {
    emailId,
  };
  let totalVolume = 0;

  const Users = await usrDao.find();
  Users.forEach((user) => {
    const userTransactions = user.transactions.filter((t) => {
      // Perform date comparison
      return t.status == "success" && t.hash == "xyzPaythrough";
    });
    userTransactions.map((item) => {
      totalVolume = Number(totalVolume) + Number(item.amount);
    });
  });

  console.log(totalVolume);
  //const aggregatedTransactions = new Map();
  //let totalSettlements =0;
  return totalVolume;
}

const getAllGateways = async () => {
  const user = await adminDao.findOne({
    emailId: "samir123@payhub",
  });

  //console.log('user',user)
  if (!user) {
    throw new Error("User not found");
  }

  // Find the transaction by its ID and update it
  const gateways = await user.gateways;
  // console.log(transaction)
  if (!gateways) {
    throw new Error("gateway not found");
  }
  let allGateways = [];

  gateways.map((item) => {
    allGateways.push({
      gatewayName: item.gatewayName,
      switch: item.switch
    });
  });

  return allGateways;
};

const getAllGatewayInfo = async (details) => {
  const user = await adminDao.findOne({
    emailId: details.emailId,
  });

  //console.log('user',user)
  if (!user) {
    throw new Error("User not found");
  }

  // Find the transaction by its ID and update it
  const gateways = await user.gateways;
  // console.log(transaction)
  if (!gateways) {
    throw new Error("gateway not found");
  }

  return gateways;
};

async function updateGatewaySettlements(query, updateDetails) {
  let update = {};
  update["$push"] = updateDetails;

  let options = {
    new: true,
  };

  return adminDao.findOneAndUpdate(
    query,
    { $push: { gatewaySettlements: updateDetails } },
    { safe: true, upsert: true, new: true }
  );
}

const getAllGatewaysSettlements = async (details) => {
  const user = await adminDao.findOne({
    emailId: "samir123@payhub",
  });

  //console.log('user',user)
  if (!user) {
    throw new Error("User not found");
  }

  // Find the transaction by its ID and update it
  const gatewaySettlements = await user.gatewaySettlements;
  // console.log(transaction)
  if (!gatewaySettlements) {
    throw new Error("gatewaySettlements not found");
  }
  let allTx = [];
  gatewaySettlements.map((details, index) => {
    let data = {
      index,
      gatewayName: details.gatewayName,
      amount: details.amount,
      ref: details.ref,
      gst: details.gst,
      notes: details.notes,
      transaction_date: details.transaction_date,
    };
    allTx.push(data);
  });
  const paginated = allTx
    .reverse()
    .slice(details.skip, details.skip + details.limit);

  return paginated;
};

const getGatewaySettlements = async (details) => {
  const user = await adminDao.findOne({
    emailId: "samir123@payhub",
  });

  //console.log('user',user)
  if (!user) {
    throw new Error("User not found");
  }

  // Find the transaction by its ID and update it
  const gatewaySettlements = await user.gatewaySettlements;
  // console.log(transaction)
  if (!gatewaySettlements) {
    throw new Error("gatewaySettlements not found");
  }

  const filtered = gatewaySettlements.filter((item) => {
    return item.gatewayName == details.gatewayName;
  });
  let allTx = [];
  filtered.map((details, index) => {
    let data = {
      index,
      gatewayName: details.gatewayName,
      amount: details.amount,
      ref: details.ref,
      gst: details.gst,
      notes: details.notes,
      transaction_date: details.transaction_date,
    };
    //data.index = index
    allTx.push(data);
  });

  const paginated = allTx
    .reverse()
    .slice(details.skip, details.skip + details.limit);

  return paginated;
};

async function getTotalVolumeMerchant(startDate, endDate, status, emailId) {
  try {
    const user = await usrDao.findOne({
      emailId,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const startDateTime = new Date(startDate + "T00:00:00.000Z");
    const endDateTime = new Date(endDate + "T23:59:59.999Z");

    let totalVolume = 0;

    if (user.transactions && user.transactions.length > 0) {
      user.transactions.forEach((transaction) => {
        console.log("Processing transaction:", transaction);

        const transactionDate = new Date(transaction.transaction_date);
        const formattedTransactionDate = moment.tz(
          transactionDate,
          "Asia/Kolkata"
        );

        const formattedStartDateTime = moment.tz(startDateTime, "Asia/Kolkata");
        const formattedEndDateTime = moment.tz(endDateTime, "Asia/Kolkata");

        if (
          (formattedTransactionDate.isSame(formattedStartDateTime, "day") ||
            formattedTransactionDate.isAfter(formattedStartDateTime, "day")) &&
          formattedTransactionDate.isBefore(formattedEndDateTime, "day") &&
          status === transaction.status
        ) {
          totalVolume += Number(transaction.amount);
        }
      });
    } else {
      console.log("User has no transactions");
    }

    console.log("Total volume for merchant:", totalVolume);
    return totalVolume;
  } catch (error) {
    console.error("Error in getTotalVolumeMerchant:", error.message);
    throw error; // rethrow the error for further handling
  }
}

// async function getTotalVolume(status) {
//   try {
//     const Users = await usrDao.find();

//     function getCurrentDateFormatted() {
//       const currentDate = moment().tz("Asia/Kolkata");

//       const year = currentDate.year();
//       const month = currentDate.month() + 1; // Months are zero-indexed in moment
//       const day = currentDate.date();

//       const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(
//         day
//       ).padStart(2, "0")}`;

//       return formattedDate;
//     }

//     const startDate = getCurrentDateFormatted();
//     const endDate = getCurrentDateFormatted();

//     console.log(startDate, endDate);

//     if (!Users || Users.length === 0) {
//       throw new Error("No users found");
//     }

//     const startDateTime = new Date(startDate + "T00:00:00.000Z");
//     const endDateTime = new Date(endDate + "T23:59:59.999Z");

//     let totalVolume = 0;

//     Users.forEach((user) => {
//       //console.log('Processing user:', user);

//       if (user.transactions && user.transactions.length > 0) {
//         //console.log('User has transactions');

//         user.transactions.forEach((transaction) => {
//           //console.log('Processing transaction:', transaction);

//           const transactionDate = new Date(transaction.transaction_date);
//           const formattedTransactionDate = moment.tz(
//             transactionDate,
//             "Asia/Kolkata"
//           );

//           const formattedStartDateTime = moment.tz(
//             startDateTime,
//             "Asia/Kolkata"
//           );
//           const formattedEndDateTime = moment.tz(endDateTime, "Asia/Kolkata");

//           if (
//             (formattedTransactionDate.isSame(formattedStartDateTime, "day") ||
//               formattedTransactionDate.isAfter(
//                 formattedStartDateTime,
//                 "day"
//               )) &&
//             formattedTransactionDate.isBefore(formattedEndDateTime, "day") &&
//             status === transaction.status
//           ) {
//             totalVolume += Number(transaction.amount);
//           }
//         });
//       } else {
//         console.log("User has no transactions");
//       }
//     });

//     console.log("Total volume:", totalVolume);
//     const updateObj = {
//       last24hr: totalVolume,
//     };
//     let query = {
//       emailId: "samir123@payhub",
//     };

//     updateProfile(query, updateObj);
//     return totalVolume;
//   } catch (error) {
//     console.error("Error in getTotalVolume:", error.message);
//     throw error; // rethrow the error for further handling
//   }
// }

async function getTotalVolume(status) {
  try {
    const startDate = moment().tz("Asia/Kolkata").startOf("day").toISOString();
    const endDate = moment().tz("Asia/Kolkata").endOf("day").toISOString();

    const result = await Transaction.aggregate([
      {
        $match: {
          "transaction_date": {
            $gte: startDate,
            $lte: endDate,
          },
          "status": status,
        },
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$amount" },
        },
      },
    ]);

    //console.log("Aggregate Result:", result);

    // Check if result is empty or totalVolume is undefined
    const totalVolume = result.length > 0 && result[0].totalVolume !== undefined
      ? result[0].totalVolume
      : 0;

    console.log("Total volume:", totalVolume);

    const updateObj = {
      last24hr: totalVolume,
    };

    const query = {
      emailId: "samir123@payhub", // Update with the appropriate emailId
    };

    await updateProfile(query, updateObj);

    return totalVolume;
  } catch (error) {
    console.error("Error in getTotalVolume:", error.message);
    throw error; // rethrow the error for further handling
  }
}


// async function updateVolumeData(status) {
//   try {
//     const Users = await usrDao.find();
//     function getCurrentDateFormatted() {
//       const currentDate = moment().tz("Asia/Kolkata");

//       const year = currentDate.year();
//       const month = currentDate.month() + 1; // Months are zero-indexed in moment
//       const day = currentDate.date();

//       const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(
//         day
//       ).padStart(2, "0")}`;

//       return formattedDate;
//     }

//     const startDate = getCurrentDateFormatted();
//     const endDate = getCurrentDateFormatted();
//     console.log(startDate, endDate);
//     if (!Users || Users.length === 0) {
//       throw new Error("No users found");
//     }

//     const startDateTime = new Date(startDate + "T00:00:00.000Z");
//     const endDateTime = new Date(endDate + "T23:59:59.999Z");

//     Users.forEach(async (user) => {
//       try {
//         let vol = 0;

//         if (user.transactions && user.transactions.length > 0) {
//           user.transactions.forEach((transaction) => {
//             const transactionDate = new Date(transaction.transaction_date);
//             const formattedTransactionDate = moment.tz(
//               transactionDate,
//               "Asia/Kolkata"
//             );

//             const formattedStartDateTime = moment.tz(
//               startDateTime,
//               "Asia/Kolkata"
//             );
//             const formattedEndDateTime = moment.tz(endDateTime, "Asia/Kolkata");

//             if (
//               (formattedTransactionDate.isSame(formattedStartDateTime, "day") ||
//                 formattedTransactionDate.isAfter(
//                   formattedStartDateTime,
//                   "day"
//                 )) &&
//               formattedTransactionDate.isBefore(formattedEndDateTime, "day") &&
//               status === transaction.status
//             ) {
//               vol += Number(transaction.amount);
//             }
//           });

//           console.log(user.emailId, " ", vol);

//           const updateObj = {
//             last24hr: vol,
//           };

//           const query = {
//             emailId: user.emailId,
//           };

//           await dao.updateProfile(query, updateObj);
//         } else {
//           console.log("User has no transactions");
//         }
//       } catch (updateError) {
//         console.error(
//           `Error updating profile for ${user.emailId}: ${updateError.message}`
//         );
//       }
//     });

//     console.log("Profile updates completed");
//   } catch (error) {
//     console.error("Error in updateVolumeData:", error.message);
//     throw error; // rethrow the error for further handling
//   }
// }

async function updateVolumeData(status) {
  try {
    const startDate = moment().tz("Asia/Kolkata").startOf("day").toISOString();
    const endDate = moment().tz("Asia/Kolkata").endOf("day").toISOString();

    const transactions = await Transaction.aggregate([
      {
        $match: {
          "transaction_date": {
            $gte: startDate,
            $lte: endDate,
          },
          "status": status,
        },
      },
    ]);
    if (!transactions || transactions.length === 0) {
      new Error("No transactions found");
    }

    const users = await usrDao.find();

    if (!users || users.length === 0) {
      new Error("No users found");
    }

    users.forEach(async (user) => {
      try {
        let vol = 0;

        const userId = String(user._id);

        transactions.forEach((transaction) => {
          if (String(transaction.uuid) === userId) {
            vol += Number(transaction.amount);
          }
        });

        console.log(user.emailId, " ", vol);

        const updateObj = {
          last24hr: vol,
        };

        const query = {
          emailId: user.emailId,
        };




        await dao.updateProfile(query, updateObj);

      } catch (updateError) {
        console.error(
          `Error updating profile for ${user.emailId}: ${updateError.message}`
        );
      }
    });

    console.log("Profile updates completed");
  } catch (error) {
    console.error("Error in updateVolumeData:", error.message);
    throw error; // rethrow the error for further handling
  }
}


// async function getTotalVolumeGateway(status, gatewayName) {
//   try {
//     const Users = await usrDao.find();

//     if (!Users) {
//       throw new Error("User not found");
//     }

//     function getCurrentDateFormatted() {
//       const currentDate = moment().tz("Asia/Kolkata");

//       const year = currentDate.year();
//       const month = currentDate.month() + 1; // Months are zero-indexed in moment
//       const day = currentDate.date();

//       const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(
//         day
//       ).padStart(2, "0")}`;

//       return formattedDate;
//     }

//     const startDate = getCurrentDateFormatted();
//     const endDate = getCurrentDateFormatted();

//     const startDateTime = new Date(startDate + "T00:00:00.000Z");
//     const endDateTime = new Date(endDate + "T23:59:59.999Z");

//     let totalVolume = 0;

//     Users.forEach(async (user) => {
//       try {
//         let vol = 0;

//         if (user.transactions && user.transactions.length > 0) {
//           user.transactions.forEach((transaction) => {
//             const transactionDate = new Date(transaction.transaction_date);
//             const formattedTransactionDate = moment.tz(
//               transactionDate,
//               "Asia/Kolkata"
//             );

//             const formattedStartDateTime = moment.tz(
//               startDateTime,
//               "Asia/Kolkata"
//             );
//             const formattedEndDateTime = moment.tz(endDateTime, "Asia/Kolkata");

//             if (
//               (formattedTransactionDate.isSame(formattedStartDateTime, "day") ||
//                 formattedTransactionDate.isAfter(
//                   formattedStartDateTime,
//                   "day"
//                 )) &&
//               formattedTransactionDate.isBefore(formattedEndDateTime, "day") &&
//               transaction.gateway &&
//               status === transaction.status &&
//               gatewayName == transaction.gateway
//             ) {
//               vol += Number(transaction.amount);
//             }
//           });

//           //console.log('volume', vol);
//           totalVolume += vol;

//           // const updateObj = {
//           //   last24hr: vol,
//           // };

//           // const query = {
//           //   emailId: user.emailId,
//           // };

//           // await dao.updateProfile(query, updateObj);
//         } else {
//           //console.log('User has no transactions');
//         }
//       } catch (updateError) {
//         console.error(
//           `Error updating profile for ${user.emailId}: ${updateError.message}`
//         );
//       }
//     });

//     //console.log('Total volume for gateway:', totalVolume);
//     return totalVolume;
//   } catch (error) {
//     console.error("Error in getTotalVolumeMerchant:", error.message);
//     throw error; // rethrow the error for further handling
//   }
// }

async function getTotalVolumeGateway(status, gatewayName) {
  try {
    // Convert startDate to IST
    const istStartDate = moment().tz('Asia/Kolkata').startOf('day').toISOString();
    // Convert endDate to IST
    const istEndDate = moment().tz('Asia/Kolkata').endOf('day').toISOString();

    const result = await Transaction.aggregate([
      {
        $match: {
          "status": status,
          "gateway": gatewayName,
          "transaction_date": { $gte: istStartDate, $lte: istEndDate }
        }
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$amount" }
        }
      }
    ]);

    // Access the total volume directly
    const totalVolume = result[0] ? result[0].totalVolume : 0;

    return totalVolume;
  } catch (error) {
    console.error('Error in getTotalVolumeGateway:', error.message);
    throw error;
  }
}


async function updateGatewayVolumeData() {
  try {
    const gateways = await getAllGateways();
    //console.log(gateways)
    gateways.map(async (item) => {
      let total = 0;
      let totalVolume = await getTotalVolumeGateway(
        "success",
        item.gatewayName
      );
      total = totalVolume;
      if (item.gatewayName == "paythrough") {
        totalVolume = await getTotalVolumeGateway(
          "success",
          "paythroughIntent"
        );
        total += totalVolume;
      }
      console.log(item.gatewayName, total);
      let body = {
        last24hr: String(total),
      };
      await updateGateway24(item.gatewayName, body);
    });

    console.log("Profile updates completed");
  } catch (error) {
    console.error("Error in updateVolumeData:", error.message);
    throw error; // rethrow the error for further handling
  }
}

async function getGatewayVolume(details) {
  const gateways = await getAllGatewayInfo(details);

  const gateway = gateways.filter((item) => {
    return item.gatewayName == details.gatewayName;
  });
  const data = {
    last24hr: Number(gateway[0].last24hr),
    yesterday: gateway[0].yesterday,
    balance: Number(gateway[0].last24hr) - gateway[0].feeCollected24hr,
    feeCollected24hr: gateway[0].feeCollected24hr,
    settlements: gateway[0].settlements,
  };
  console.log(data);
  return data;
}

async function getGatewayInfo(details) {
  const gateways = await getAllGatewayInfo(details);

  const gateway = gateways.filter((item) => {
    return item.gatewayName == details.gatewayName;
  });
  const data = {
    balance: gateway[0].balance,
    settlements: gateway[0].settlements,
  };
  console.log(data);
  return data;
}

async function getTotalGatewaysVolume(details) {
  const gateways = await getAllGatewayInfo(details);
  let last24hr = 0;
  let yesterday = 0;
  let settlements = 0;
  let balance = 0;
  let feeCollected24hr = 0;
  console.log(gateways);
  for (let item = 0; item < gateways.length; item++) {
    last24hr += Number(gateways[item].last24hr);
    yesterday += gateways[item].yesterday;
    settlements += gateways[item].settlements;
    balance += Number(gateways[item].last24hr);
    feeCollected24hr += gateways[item].feeCollected24hr;
  }
  const data = {
    last24hr: last24hr,
    yesterday: yesterday,
    feeCollected24hr,
    balance: balance - feeCollected24hr,
    settlements: settlements,
  };
  console.log(data);
  return data;
}

async function getTotalGatewayBalance(hash) {
  try {
    const result = await Transaction.aggregate([
      {
        $match: {
          "status": "success",
          "hash": hash
        }
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$amount" }
        }
      }
    ]);

    // Access the total volume directly
    const totalVolume = result[0] ? result[0].totalVolume : 0;

    return totalVolume;
  } catch (error) {
    console.error('Error in getTotalGatewayBalance:', error.message);
    throw error;
  }
}

async function updateTotalGatewayBalance() {
  const gateways = await getAllGatewayInfo({
    emailId: "samir123@payhub",
  });

  gateways.map(async (item) => {
    let total = 0;
    let totalVolume = await getTotalGatewayBalance(item.hash);
    total = totalVolume;
    const settlements = item.settlements;
    const balance = total - settlements;
    //console.log(item.gatewayName, balance, settlements);
    let body = {
      balance: balance,
    };
    console.log(item.gatewayName, balance)
    await updateGatewayBalance(item.gatewayName, body);
  });
}

async function getTotalMerechantBalance(emailId, uuid, status) {
  try {
    const User = await usrDao.findOne({
      emailId: emailId,
    });

    const result = await Transaction.aggregate([
      {
        $match: {
          uuid: String(uuid),
          "status": status
        }
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$amount" }
        }
      }
    ]);

    const totalVolume = result[0] ? result[0].totalVolume : 0;
    let totalSettlements = 0

    // Calculate total settlements
    User.settlements.forEach(async (transaction) => {
      try {

        totalSettlements = totalSettlements + transaction.amount;


      } catch (updateError) {
        console.error(
          `Error updating profile for ${user.emailId}: ${updateError.message}`
        );
      }
    });

    const totalSettlementAmount = totalSettlements ? totalSettlements : 0;

    const balance = totalVolume - totalSettlementAmount;

    return balance;
  } catch (error) {
    console.error("Error in getTotalMerchantBalance:", error.message);
    throw error;
  }
}




async function updateBalanceMerchants() {
  try {
    const Users = await usrDao.find();

    if (!Users) {
      throw new Error("User not found");
    }

    Users.forEach(async (user) => {
      try {
        let vol = 0;

        if (user) {


          vol = await getTotalMerechantBalance(user.emailId, String(user._id), 'success')

          console.log('volume', vol);


          const updateObj = {
            balance: vol,
          };

          const query = {
            emailId: user.emailId,
          };

          await dao.updateProfile(query, updateObj);

        } else {
          //console.log('User has no transactions');
        }
      } catch (updateError) {
        console.error(
          `Error updating profile for ${user.emailId}: ${updateError.message}`
        );
      }
    });

    //console.log('Total volume for gateway:', totalVolume);

  } catch (error) {
    console.error("Error in getTotalVolumeMerchant:", error.message);
    throw error; // rethrow the error for further handling
  }
}

async function getTotalAdminBalance(emailId, uuid, status) {
  try {
    const user = await usrDao.findOne({
      emailId: emailId,
    });
    const result = await Transaction.aggregate([
      {
        $match: {
          uuid: uuid,
          "status": status
        }
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$amount" }
        }
      }
    ]);

    const totalVolume = result[0] ? result[0].totalVolume : 0;
    let totalSettlements = 0;

    // Calculate total settlements
    for (const settlement of user.settlements) {
      try {
        totalSettlements += Number(settlement.amount);
      } catch (updateError) {
        console.error(
          `Error updating profile for ${user.emailId}: ${updateError.message}`
        );
      }
    }

    const totalSettlementAmount = totalSettlements ? totalSettlements : 0;

    const balance = totalVolume - totalSettlementAmount;

    return balance;
  } catch (error) {
    console.error("Error in getTotalAdminBalance:", error.message);
    throw error;
  }
}


async function updateBalanceAdmin() {
  try {
    const users = await usrDao.find();

    if (!users) {
      throw new Error("Users not found");
    }

    let totalBalance = 0;

    for (const user of users) {
      try {
        let vol = 0;


        vol = await getTotalAdminBalance(user.emailId, String(user._id), 'success');
        totalBalance += vol;

      } catch (updateError) {
        console.error(
          `Error updating profile for ${user.emailId}: ${updateError.message}`
        );
      }
    }

    console.log('Total volume', totalBalance);
    const updateObj = {
      balance: totalBalance,
    };

    const query = {
      emailId: "samir123@payhub"
    };

    await updateProfile(query, updateObj)

  } catch (error) {
    console.error("Error in updateBalanceAdmin:", error.message);
    throw error;
  }
}



module.exports = {
  getUserDetails,

  createUser,

  // updateWallet,

  updateProfile,

  // getWalletdetail,

  // getAllWallets,

  // updateTransaction,

  getAllTransactions,

  getAllUsersTransactions,

  updateUserProfile,

  getUserBalance,

  updateTransactionData,

  updateUserProfile2,

  updateTransactions,

  getUserBalance2,

  updateUserGateway,

  getAllUserTransactions,

  updateSettlement,

  getUser,

  getUserTransactionsData,

  getTransactionsByStatus,

  getTransactionByDate,

  getMerchantDetails,

  updateTransaction,

  getTransactionDetails,

  updateGatewayData,

  getGatewayDetails,

  updateGatewayDetails,

  updateGatewayCollectionFee,

  updateGatewayPayoutFee,

  updateGatewayFees,

  updateGatewayDetailsPayin,

  getAllTransactionByDate,

  updateGateway,

  getAllTransactionByDateWithStatus,

  getAllTransactionWithStatus,

  getTransactionByDateWithStatus,

  getAllTransactionWithPendingStatus,

  getAllTransactionWithSuccessStatus,

  getTotalVolumeAndSettlements,

  getTotalGatewayVolume,

  getTotalVolume,

  getTotalVolumeMerchant,

  updateVolumeData,

  getAllGateways,

  updateGatewaySettlements,

  getAllGatewaysSettlements,

  getGatewaySettlements,

  getTotalVolumeGateway,

  updateGatewayVolumeData,

  getGatewayVolume,

  getTotalGatewaysVolume,

  updateTotalGatewayBalance,

  getGatewayInfo,

  updateGatewaySettlementsAndBalance,

  getTotalMerechantBalance,

  updateBalanceMerchants,

  updateBalanceAdmin,

  updateGatewaySwitch
};

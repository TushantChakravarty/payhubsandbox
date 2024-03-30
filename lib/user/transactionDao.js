const moment = require("moment-timezone");
const transactionsModel = require("../generic/models/transactionsModel");
const userModel = require("../generic/models/userModel");
const { Transaction, MainModel } = require("../generic/models/TransactionData"); // Adjust the path accordingly

let BaseDao = require("../dao/BaseDao");
const { getUserId } = require("./userDao");
const ObjectId = require("mongoose").Types.ObjectId;
const transactionDao = new BaseDao(transactionsModel);
const userDao = new BaseDao(userModel);

async function updateTransactionsData(updateData) {
  const targetObjectId = "6575f177435fd406e1991f05";
  const filter = { _id: ObjectId(targetObjectId) };

  // Update the document by pushing the single transaction data
  transactionsModel.updateOne(
    filter,
    { $push: { transactions: updateData } },
    function (err, result) {
      if (err) {
        console.error("Error updating document:", err);
      } else {
        console.log("Document updated successfully");
      }
    }
  );
}

// async function updateTransactionStatus(transactionId, updateData) {

//     const targetObjectId = '6575f177435fd406e1991f05';
//     const filter = {
//         _id: ObjectId(targetObjectId),
//         'transactions.transactionId': transactionId,
//       };

//       const update = {
//         $set: {
//           'transactions.$.status': updateData.status,
//           'transactions.$.utr': updateData.utr,
//           // Add other fields you want to update
//         },
//       };

//       const result = await transactionDao.updateOne(filter, update);

//       if (result.modifiedCount > 0) {
//         console.log('Document updated successfully');
//       } else {
//         console.log('No document matched the criteria');
//       }
// }
async function updateTransactionStatus(transactionId, updateData) {
  try {
    const filter = {
      transactionId: transactionId,
    };

    const update = {
      $set: {
        status: updateData.status,
        utr: updateData.utr,
        reason: updateData?.reason,
        code:updateData?.code,
        // Add other fields you want to update
      },
    };

    const options = {
      new: true, // Return the modified document
    };

    const updatedTransaction = await Transaction.findOneAndUpdate(
      filter,
      update,
      options
    );

    if (updatedTransaction) {
      //console.log('Transaction updated successfully:', updatedTransaction);
      return updatedTransaction;
    } else {
      console.log("No transaction matched the criteria");
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// async function getAllTransactions(skip,limit) {

//   const result = await transactionDao.aggregate([
//     {
//       $match: { _id: ObjectId('6575f177435fd406e1991f05') }
//     },
//     {
//       $project: {
//         reversedTransactions: { $reverseArray: "$transactions" }
//       }
//     },
//     {
//       $project: {
//         paginatedTransactions: { $slice: ["$reversedTransactions", skip, limit] }
//       }
//     }
//   ]);

//   // Access the reversed and paginated transactions
//   const reversedTransactions = result[0].reversedTransactions;
//   const paginatedTransactions = result[0].paginatedTransactions;

//   return paginatedTransactions;
// }

async function getAllTransactions(skip, limit) {
  try {
    const paginatedTransactions = await Transaction.aggregate([
      {
        $sort: { _id: -1 }, // Assuming _id is a sortable field
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    return paginatedTransactions;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

async function getCompleteTransactions() {
  const result = await transactionDao.aggregate([
    {
      $match: { _id: ObjectId("6575f177435fd406e1991f05") },
    },
  ]);

  // Access the reversed and paginated transactions
  const reversedTransactions = result[0];
  console.log(reversedTransactions);
  reversedTransactions.map(item);

  //const paginatedTransactions = result[0].paginatedTransactions;

  return reversedTransactions;
}

async function getAllTransactionsData(limit, skip, statusFilter) {
  try {
    const paginatedTransactions = await Transaction.aggregate([
      {
        $sort: { _id: -1 }, // Assuming _id is a sortable field
      },
      {
        $match: { status: statusFilter }, // Add this stage to filter by status
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    return paginatedTransactions?paginatedTransactions:[];
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// async function getTotalVolume(statusFilter) {
//   const result = await transactionDao.aggregate([
//     {
//       $match: { _id: ObjectId('6575f177435fd406e1991f05') }
//     },
//     {
//       $unwind: "$transactions"
//     },
//     {
//       $match: { "transactions.status": statusFilter }
//     },
//     {
//       $group: {
//         _id: null,
//         totalVolume: { $sum: "$transactions.amount" },
//         totalCount: { $sum: 1 } // Count the number of transactions
//       }
//     }
//   ]);

//   // Access the total volume and total count directly
//   const totalVolume = result[0] ? result[0].totalVolume : 0;
//   const totalCount = result[0] ? result[0].totalCount : 0;

//   return { totalVolume, totalCount };
// }
async function getTotalVolume(statusFilter) {
  try {
    const result = await Transaction.aggregate([
      {
        $match: { status: statusFilter },
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$amount" },
          totalCount: { $sum: 1 }, // Count the number of transactions
        },
      },
    ]);

    // Access the total volume and total count directly
    const totalVolume = result[0] ? result[0].totalVolume : 0;
    const totalCount = result[0] ? result[0].totalCount : 0;

    return { totalVolume, totalCount };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

async function getDataById(id) {
  try {
    const result = await Transaction.findOne({
      $or: [{ transactionId: id }, { utr: id }],
    });

    return result;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

async function getTransactionById(id) {
  const result = await transactionDao.aggregate([
    {
      $match: { _id: ObjectId("6575f177435fd406e1991f05") },
    },
    {
      $unwind: "$transactions",
    },
    {
      $match: {
        $or: [{ "transactions.transactionId": id }],
      },
    },
    {
      $group: {
        _id: null,
        transaction: { $first: "$transactions" }, // Use $first to get the first matching transaction
      },
    },
  ]);

  // Access the matching transaction directly
  const matchingTransaction = result[0] ? result[0].transaction : null;

  return matchingTransaction;
}

async function getAllMerchantTransactions() {
  const indianTimeZone = "Asia/Kolkata";

  const result = await transactionDao.findOne({
    _id: ObjectId("6575f177435fd406e1991f05"),
  });

  return result.transactions;
}

// async function getTotalVolumeByGatewayAndStatus(status, gateway) {
//   let gatewayFilter;
//   if (gateway === 'paythrough') {
//     gatewayFilter = { $in: ["paythrough", "paythroughIntent"] };
//   } else {
//     gatewayFilter = gateway;
//   }

//   const result = await transactionDao.aggregate([
//     {
//       $match: { _id: ObjectId('6575f177435fd406e1991f05') }
//     },
//     {
//       $unwind: "$transactions"
//     },
//     {
//       $match: {
//         $and: [
//           { "transactions.status": status },
//           { "transactions.gateway": gatewayFilter }
//         ]
//       }
//     },
//     {
//       $group: {
//         _id: null,
//         totalVolume: { $sum: "$transactions.amount" },
//         totalCount: { $sum: 1 } // Count the number of transactions
//       }
//     }
//   ]);

//   // Access the total volume and total count directly
//   const totalVolume = result[0] ? result[0].totalVolume : 0;
//   const totalCount = result[0] ? result[0].totalCount : 0;

//   return { totalVolume, totalCount };
//   }

async function getTotalVolumeByGatewayAndStatus(status, gateway) {
  try {
    let gatewayFilter;
    if (gateway === "paythrough") {
      gatewayFilter = { $in: ["paythrough", "paythroughIntent"] };
    } else {
      gatewayFilter = gateway;
    }

    const result = await Transaction.aggregate([
      {
        $match: {
          status: status,
          gateway: gatewayFilter,
        },
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$amount" },
          totalCount: { $sum: 1 }, // Count the number of transactions
        },
      },
    ]);

    // Access the total volume and total count directly
    const totalVolume = result[0] ? result[0].totalVolume : 0;
    const totalCount = result[0] ? result[0].totalCount : 0;

    return { totalVolume, totalCount };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// async function getTotalVolumeByGatewayAndDate(status, gateway, startDate, endDate) {
//   // Convert startDate to IST
//   const istStartDate = moment.tz(startDate, 'Asia/Kolkata').startOf('day').toISOString();
//   // Convert endDate to IST
//   const istEndDate = moment.tz(endDate, 'Asia/Kolkata').endOf('day').toISOString();

//   let gatewayFilter;
//   if (gateway === 'paythrough') {
//     gatewayFilter = { $in: ["paythrough", "paythroughIntent"] };
//   } else {
//     gatewayFilter = gateway;
//   }

//   const result = await transactionDao.aggregate([
//     {
//       $match: { _id: ObjectId('6575f177435fd406e1991f05') }
//     },
//     {
//       $unwind: "$transactions"
//     },
//     {
//       $match: {
//         $and: [
//           { "transactions.status": status },
//           { "transactions.gateway": gatewayFilter },
//           { "transactions.transaction_date": { $gte: istStartDate, $lte: istEndDate } }
//         ]
//       }
//     },
//     {
//       $group: {
//         _id: null,
//         totalVolume: { $sum: "$transactions.amount" },
//         totalCount: { $sum: 1 } // Count the number of transactions
//       }
//     }
//   ]);

//   // Access the total volume and total count directly
//   const totalVolume = result[0] ? result[0].totalVolume : 0;
//   const totalCount = result[0] ? result[0].totalCount : 0;

//   return { totalVolume, totalCount };
// }

async function getTotalVolumeByGatewayAndDate(
  status,
  gateway,
  startDate,
  endDate
) {
  try {
    // Convert startDate to IST
    const istStartDate = moment
      .tz(startDate, "Asia/Kolkata")
      .startOf("day")
      .toISOString();
    // Convert endDate to IST
    const istEndDate = moment
      .tz(endDate, "Asia/Kolkata")
      .endOf("day")
      .toISOString();

    let gatewayFilter;
    if (gateway === "paythrough") {
      gatewayFilter = { $in: ["paythrough", "paythroughIntent"] };
    } else {
      gatewayFilter = gateway;
    }

    const result = await Transaction.aggregate([
      {
        $match: {
          status: status,
          gateway: gatewayFilter,
          transaction_date: { $gte: istStartDate, $lte: istEndDate },
        },
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$amount" },
          totalCount: { $sum: 1 }, // Count the number of transactions
        },
      },
    ]);

    // Access the total volume and total count directly
    const totalVolume = result[0] ? result[0].totalVolume : 0;
    const totalCount = result[0] ? result[0].totalCount : 0;

    return { totalVolume, totalCount };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// async function getTotalVolumeByDate(status, startDate, endDate) {
//   // Convert startDate to IST
//   const istStartDate = moment.tz(startDate, 'Asia/Kolkata').startOf('day').toISOString();
//   // Convert endDate to IST
//   const istEndDate = moment.tz(endDate, 'Asia/Kolkata').endOf('day').toISOString();

//   // let gatewayFilter;
//   // if (gateway === 'paythrough') {
//   //   gatewayFilter = { $in: ["paythrough", "paythroughIntent"] };
//   // } else {
//   //   gatewayFilter = gateway;
//   // }

//   const result = await transactionDao.aggregate([
//     {
//       $match: { _id: ObjectId('6575f177435fd406e1991f05') }
//     },
//     {
//       $unwind: "$transactions"
//     },
//     {
//       $match: {
//         $and: [
//           { "transactions.status": status },
//           { "transactions.transaction_date": { $gte: istStartDate, $lte: istEndDate } }
//         ]
//       }
//     },
//     {
//       $group: {
//         _id: null,
//         totalVolume: { $sum: "$transactions.amount" },
//         totalCount: { $sum: 1 } // Count the number of transactions
//       }
//     }
//   ]);

//   // Access the total volume and total count directly
//   const totalVolume = result[0] ? result[0].totalVolume : 0;
//   const totalCount = result[0] ? result[0].totalCount : 0;

//   return { totalVolume, totalCount };
// }

async function getTotalVolumeByDate(status, startDate, endDate) {
  try {
    // Convert startDate to IST
    const istStartDate = moment
      .tz(startDate, "Asia/Kolkata")
      .startOf("day")
      .toISOString();
    // Convert endDate to IST
    const istEndDate = moment
      .tz(endDate, "Asia/Kolkata")
      .endOf("day")
      .toISOString();

    const result = await Transaction.aggregate([
      {
        $match: {
          status: status,
          transaction_date: { $gte: istStartDate, $lte: istEndDate },
        },
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$amount" },
          totalCount: { $sum: 1 }, // Count the number of transactions
        },
      },
    ]);

    // Access the total volume and total count directly
    const totalVolume = result[0] ? result[0].totalVolume : 0;
    const totalCount = result[0] ? result[0].totalCount : 0;

    return { totalVolume, totalCount };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// async function getTotalVolumeByDateWithTime(status, startDate, endDate, startTime, endTime) {
//   // Convert startDate to IST
//   const istStartDate = moment.tz(startDate, 'Asia/Kolkata').startOf('day').toISOString();
//   // Convert endDate to IST
//   const istEndDate = moment.tz(endDate, 'Asia/Kolkata').endOf('day').toISOString();

//   const result = await transactionDao.aggregate([
//     {
//       $match: { _id: ObjectId('6575f177435fd406e1991f05') }
//     },
//     {
//       $unwind: "$transactions"
//     },
//     {
//       $addFields: {
//         istTransactionDate: {
//           $dateToString: {
//             format: '%Y-%m-%dT%H:%M:%S.%LZ',
//             date: { $toDate: "$transactions.transaction_date" },
//             timezone: 'Asia/Kolkata'
//           }
//         }
//       }
//     },
//     {
//       $match: {
//         $and: [
//           { "transactions.status": status },
//           { "transactions.transaction_date": { $gte: istStartDate, $lte: istEndDate } },
//           {
//             $expr: {
//               $and: [
//                 { $gte: ["$istTransactionDate", `${startDate}T${startTime}.000Z`] },
//                 { $lte: ["$istTransactionDate", `${endDate}T${endTime}.000Z`] }
//               ]
//             }
//           }
//         ]
//       }
//     },
//     {
//       $group: {
//         _id: null,
//         totalVolume: { $sum: "$transactions.amount" },
//         totalCount: { $sum: 1 } // Count the number of transactions
//       }
//     }
//   ]);

//   // Access the total volume and total count directly
//   const totalVolume = result[0] ? result[0].totalVolume : 0;
//   const totalCount = result[0] ? result[0].totalCount : 0;

//   return { totalVolume, totalCount };
// }

async function getTotalVolumeByDateWithTime(
  status,
  startDate,
  endDate,
  startTime,
  endTime
) {
  try {
    // Convert startDate to IST
    const istStartDate = moment
      .tz(startDate, "Asia/Kolkata")
      .startOf("day")
      .toISOString();
    // Convert endDate to IST
    const istEndDate = moment
      .tz(endDate, "Asia/Kolkata")
      .endOf("day")
      .toISOString();

    const result = await Transaction.aggregate([
      {
        $match: {
          status: status,
          transaction_date: { $gte: istStartDate, $lte: istEndDate },
        },
      },
      {
        $addFields: {
          istTransactionDate: {
            $dateToString: {
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
              date: { $toDate: "$transaction_date" },
              timezone: "Asia/Kolkata",
            },
          },
        },
      },
      {
        $match: {
          $expr: {
            $and: [
              {
                $gte: ["$istTransactionDate", `${startDate}T${startTime}.000Z`],
              },
              { $lte: ["$istTransactionDate", `${endDate}T${endTime}.000Z`] },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$amount" },
          totalCount: { $sum: 1 }, // Count the number of transactions
        },
      },
    ]);

    // Access the total volume and total count directly
    const totalVolume = result[0] ? result[0].totalVolume : 0;
    const totalCount = result[0] ? result[0].totalCount : 0;

    return { totalVolume, totalCount };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// async function getTotalVolumeByGatewayAndDateWithTime(status, gateway, startDate, endDate, startTime, endTime) {
//   // Convert startDate to IST
//   const istStartDate = moment.tz(startDate, 'Asia/Kolkata').startOf('day').toISOString();
//   // Convert endDate to IST
//   const istEndDate = moment.tz(endDate, 'Asia/Kolkata').endOf('day').toISOString();

//   let gatewayFilter;
//   if (gateway === 'paythrough') {
//     gatewayFilter = { $in: ["paythrough", "paythroughIntent"] };
//   } else {
//     gatewayFilter = gateway;
//   }

//   const result = await transactionDao.aggregate([
//     {
//       $match: { _id: ObjectId('6575f177435fd406e1991f05') }
//     },
//     {
//       $unwind: "$transactions"
//     },
//     {
//       $addFields: {
//         istTransactionDate: {
//           $dateToString: {
//             format: '%Y-%m-%dT%H:%M:%S.%LZ',
//             date: { $toDate: "$transactions.transaction_date" },
//             timezone: 'Asia/Kolkata'
//           }
//         }
//       }
//     },
//     {
//       $match: {
//         $and: [
//           { "transactions.status": status },
//           { "transactions.gateway": gatewayFilter },
//           { "transactions.transaction_date": { $gte: istStartDate, $lte: istEndDate } },
//           {
//             $expr: {
//               $and: [
//                 { $gte: ["$istTransactionDate", `${startDate}T${startTime}.000Z`] },
//                 { $lte: ["$istTransactionDate", `${endDate}T${endTime}.000Z`] }
//               ]
//             }
//           }
//         ]
//       }
//     },
//     {
//       $group: {
//         _id: null,
//         totalVolume: { $sum: "$transactions.amount" },
//         totalCount: { $sum: 1 } // Count the number of transactions
//       }
//     }
//   ]);

//   // Access the total volume and total count directly
//   const totalVolume = result[0] ? result[0].totalVolume : 0;
//   const totalCount = result[0] ? result[0].totalCount : 0;

//   return { totalVolume, totalCount };
// }

async function getTotalVolumeByGatewayAndDateWithTime(
  status,
  gateway,
  startDate,
  endDate,
  startTime,
  endTime
) {
  try {
    // Convert startDate to IST
    const istStartDate = moment
      .tz(startDate, "Asia/Kolkata")
      .startOf("day")
      .toISOString();
    // Convert endDate to IST
    const istEndDate = moment
      .tz(endDate, "Asia/Kolkata")
      .endOf("day")
      .toISOString();

    let gatewayFilter;
    if (gateway === "paythrough") {
      gatewayFilter = { $in: ["paythrough", "paythroughIntent"] };
    } else {
      gatewayFilter = gateway;
    }

    const result = await Transaction.aggregate([
      {
        $match: {
          status: status,
          gateway: gatewayFilter,
          transaction_date: { $gte: istStartDate, $lte: istEndDate },
        },
      },
      {
        $addFields: {
          istTransactionDate: {
            $dateToString: {
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
              date: { $toDate: "$transaction_date" },
              timezone: "Asia/Kolkata",
            },
          },
        },
      },
      {
        $match: {
          $and: [
            { status: status },
            { gateway: gatewayFilter },
            { transaction_date: { $gte: istStartDate, $lte: istEndDate } },
            {
              $expr: {
                $and: [
                  {
                    $gte: [
                      "$istTransactionDate",
                      `${startDate}T${startTime}.000Z`,
                    ],
                  },
                  {
                    $lte: ["$istTransactionDate", `${endDate}T${endTime}.000Z`],
                  },
                ],
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$amount" },
          totalCount: { $sum: 1 }, // Count the number of transactions
        },
      },
    ]);

    // Access the total volume and total count directly
    const totalVolume = result[0] ? result[0].totalVolume : 0;
    const totalCount = result[0] ? result[0].totalCount : 0;

    return { totalVolume, totalCount };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

async function getTransactionsByDate(startDate, endDate) {
  try {
    // Convert startDate to IST
    const istStartDate = moment
      .tz(startDate, "Asia/Kolkata")
      .startOf("day")
      .toISOString();
    // Convert endDate to IST
    const istEndDate = moment
      .tz(endDate, "Asia/Kolkata")
      .endOf("day")
      .toISOString();

    const result = await Transaction.aggregate([
      {
        $match: {
          transaction_date: { $gte: istStartDate, $lte: istEndDate },
        },
      },
    ]);

    return result;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

async function getTransactionsByDateAndStatus(startDate, endDate, status) {
  try {
    // Convert startDate to IST
    const istStartDate = moment
      .tz(startDate, "Asia/Kolkata")
      .startOf("day")
      .toISOString();
    // Convert endDate to IST
    const istEndDate = moment
      .tz(endDate, "Asia/Kolkata")
      .endOf("day")
      .toISOString();

    const result = await Transaction.aggregate([
      {
        $match: {
          transaction_date: { $gte: istStartDate, $lte: istEndDate },
          status: status,
        },
      },
    ]);

    return result;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// async function getTotalVolumeMerchant(emailId, statusFilter) {
//   const result = await userDao.aggregate([
//     {
//       $match: { emailId: emailId }
//     },
//     {
//       $unwind: "$transactions"
//     },
//     {
//       $match: { "transactions.status": statusFilter }
//     },
//     {
//       $group: {
//         _id: null,
//         totalVolume: { $sum: "$transactions.amount" },
//         totalCount: { $sum: 1 } // Count the number of transactions
//       }
//     }
//   ]);

//   // Access the total volume and total count directly
//   const totalVolume = result[0] ? result[0].totalVolume : 0;
//   const totalCount = result[0] ? result[0].totalCount : 0;

//   return { totalVolume, totalCount };
// }
async function getTotalVolumeMerchant(emailId, statusFilter) {
  try {
    const userId = await getUserId(emailId);
    const result = await Transaction.aggregate([
      {
        $match: {
          uuid: userId, // Assuming uuid is a string representation of the user's Object ID
          status: statusFilter,
        },
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$amount" },
          totalCount: { $sum: 1 }, // Count the number of transactions
        },
      },
    ]);

    // Access the total volume and total count directly
    const totalVolume = result[0] ? result[0].totalVolume : 0;
    const totalCount = result[0] ? result[0].totalCount : 0;

    return { totalVolume, totalCount };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// async function getTotalVolumeMerchantWithGateway(emailId, statusFilter,gateway) {
//   let gatewayFilter;
//     if (gateway === 'paythrough') {
//       gatewayFilter = { $in: ["paythrough", "paythroughIntent"] };
//     } else {
//       gatewayFilter = gateway;
//     }
//   const result = await userDao.aggregate([
//     {
//       $match: { emailId: emailId }
//     },
//     {
//       $unwind: "$transactions"
//     },
//     {
//       $match: {
//         $and: [
//           { "transactions.status": statusFilter },
//           { "transactions.gateway": gatewayFilter }
//         ]
//       }
//     },
//     {
//       $group: {
//         _id: null,
//         totalVolume: { $sum: "$transactions.amount" },
//         totalCount: { $sum: 1 } // Count the number of transactions
//       }
//     }
//   ]);

//   // Access the total volume and total count directly
//   const totalVolume = result[0] ? result[0].totalVolume : 0;
//   const totalCount = result[0] ? result[0].totalCount : 0;

//   return { totalVolume, totalCount };
// }

async function getTotalVolumeMerchantWithGateway(
  emailId,
  statusFilter,
  gateway
) {
  try {
    const userId = await getUserId(emailId);
    let gatewayFilter;
    if (gateway === "paythrough") {
      gatewayFilter = { $in: ["paythrough", "paythroughIntent"] };
    } else {
      gatewayFilter = gateway;
    }

    const result = await Transaction.aggregate([
      {
        $match: { uuid: userId, status: statusFilter, gateway: gatewayFilter },
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$amount" },
          totalCount: { $sum: 1 }, // Count the number of transactions
        },
      },
    ]);

    // Access the total volume and total count directly
    const totalVolume = result[0] ? result[0].totalVolume : 0;
    const totalCount = result[0] ? result[0].totalCount : 0;

    return { totalVolume, totalCount };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// async function getTotalMerchantVolumeByGatewayAndDate(emailId,status, gateway, startDate, endDate) {
//   // Convert startDate to IST
//   const istStartDate = moment.tz(startDate, 'Asia/Kolkata').startOf('day').toISOString();
//   // Convert endDate to IST
//   const istEndDate = moment.tz(endDate, 'Asia/Kolkata').endOf('day').toISOString();

//   let gatewayFilter;
//   if (gateway === 'paythrough') {
//     gatewayFilter = { $in: ["paythrough", "paythroughIntent"] };
//   } else {
//     gatewayFilter = gateway;
//   }

//   const result = await userDao.aggregate([
//     {
//       $match: { emailId: emailId }
//     },
//     {
//       $unwind: "$transactions"
//     },
//     {
//       $match: {
//         $and: [
//           { "transactions.status": status },
//           { "transactions.gateway": gatewayFilter },
//           { "transactions.transaction_date": { $gte: istStartDate, $lte: istEndDate } }
//         ]
//       }
//     },
//     {
//       $group: {
//         _id: null,
//         totalVolume: { $sum: "$transactions.amount" },
//         totalCount: { $sum: 1 } // Count the number of transactions
//       }
//     }
//   ]);

//   // Access the total volume and total count directly
//   const totalVolume = result[0] ? result[0].totalVolume : 0;
//   const totalCount = result[0] ? result[0].totalCount : 0;

//   return { totalVolume, totalCount };
// }

async function getTotalMerchantVolumeByGatewayAndDate(
  emailId,
  status,
  gateway,
  startDate,
  endDate
) {
  try {
    // Convert startDate to IST
    const istStartDate = moment
      .tz(startDate, "Asia/Kolkata")
      .startOf("day")
      .toISOString();
    // Convert endDate to IST
    const istEndDate = moment
      .tz(endDate, "Asia/Kolkata")
      .endOf("day")
      .toISOString();

    const userId = await getUserId(emailId);
    let gatewayFilter;
    if (gateway === "paythrough") {
      gatewayFilter = { $in: ["paythrough", "paythroughIntent"] };
    } else {
      gatewayFilter = gateway;
    }

    const result = await Transaction.aggregate([
      {
        $match: {
          uuid: userId,
          status: status,
          gateway: gatewayFilter,
          transaction_date: { $gte: istStartDate, $lte: istEndDate },
        },
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$amount" },
          totalCount: { $sum: 1 }, // Count the number of transactions
        },
      },
    ]);

    // Access the total volume and total count directly
    const totalVolume = result[0] ? result[0].totalVolume : 0;
    const totalCount = result[0] ? result[0].totalCount : 0;

    return { totalVolume, totalCount };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// async function getTotalMerchantVolumeByDate(emailId,status, startDate, endDate) {
//   // Convert startDate to IST
//   const istStartDate = moment.tz(startDate, 'Asia/Kolkata').startOf('day').toISOString();
//   // Convert endDate to IST
//   const istEndDate = moment.tz(endDate, 'Asia/Kolkata').endOf('day').toISOString();

//   const result = await userDao.aggregate([
//     {
//       $match: { emailId: emailId }
//     },
//     {
//       $unwind: "$transactions"
//     },
//     {
//       $match: {
//         $and: [
//           { "transactions.status": status },
//           { "transactions.transaction_date": { $gte: istStartDate, $lte: istEndDate } }
//         ]
//       }
//     },
//     {
//       $group: {
//         _id: null,
//         totalVolume: { $sum: "$transactions.amount" },
//         totalCount: { $sum: 1 } // Count the number of transactions
//       }
//     }
//   ]);

//   // Access the total volume and total count directly
//   const totalVolume = result[0] ? result[0].totalVolume : 0;
//   const totalCount = result[0] ? result[0].totalCount : 0;

//   return { totalVolume, totalCount };
// }

async function getTotalMerchantVolumeByDate(
  emailId,
  status,
  startDate,
  endDate
) {
  try {
    // Convert startDate to IST
    const istStartDate = moment
      .tz(startDate, "Asia/Kolkata")
      .startOf("day")
      .toISOString();
    // Convert endDate to IST
    const istEndDate = moment
      .tz(endDate, "Asia/Kolkata")
      .endOf("day")
      .toISOString();

    const userId = await getUserId(emailId);

    const result = await Transaction.aggregate([
      {
        $match: {
          uuid: userId,
          status: status,
          transaction_date: { $gte: istStartDate, $lte: istEndDate },
        },
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$amount" },
          totalCount: { $sum: 1 }, // Count the number of transactions
        },
      },
    ]);

    // Access the total volume and total count directly
    const totalVolume = result[0] ? result[0].totalVolume : 0;
    const totalCount = result[0] ? result[0].totalCount : 0;

    return { totalVolume, totalCount };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// async function getTotalMerchantVolumeByGatewayAndDateWithTime(emailId,status, gateway, startDate, endDate, startTime, endTime) {
//   // Convert startDate to IST
//   const istStartDate = moment.tz(startDate, 'Asia/Kolkata').startOf('day').toISOString();
//   // Convert endDate to IST
//   const istEndDate = moment.tz(endDate, 'Asia/Kolkata').endOf('day').toISOString();

//   let gatewayFilter;
//   if (gateway === 'paythrough') {
//     gatewayFilter = { $in: ["paythrough", "paythroughIntent"] };
//   } else {
//     gatewayFilter = gateway;
//   }

//   const result = await userDao.aggregate([
//     {
//       $match: { emailId: emailId }
//     },
//     {
//       $unwind: "$transactions"
//     },
//     {
//       $addFields: {
//         istTransactionDate: {
//           $dateToString: {
//             format: '%Y-%m-%dT%H:%M:%S.%LZ',
//             date: { $toDate: "$transactions.transaction_date" },
//             timezone: 'Asia/Kolkata'
//           }
//         }
//       }
//     },
//     {
//       $match: {
//         $and: [
//           { "transactions.status": status },
//           { "transactions.gateway": gatewayFilter },
//           { "transactions.transaction_date": { $gte: istStartDate, $lte: istEndDate } },
//           {
//             $expr: {
//               $and: [
//                 { $gte: ["$istTransactionDate", `${startDate}T${startTime}.000Z`] },
//                 { $lte: ["$istTransactionDate", `${endDate}T${endTime}.000Z`] }
//               ]
//             }
//           }
//         ]
//       }
//     },
//     {
//       $group: {
//         _id: null,
//         totalVolume: { $sum: "$transactions.amount" },
//         totalCount: { $sum: 1 } // Count the number of transactions
//       }
//     }
//   ]);

//   // Access the total volume and total count directly
//   const totalVolume = result[0] ? result[0].totalVolume : 0;
//   const totalCount = result[0] ? result[0].totalCount : 0;

//   return { totalVolume, totalCount };
// }

async function getTotalMerchantVolumeByGatewayAndDateWithTime(
  emailId,
  status,
  gateway,
  startDate,
  endDate,
  startTime,
  endTime
) {
  try {
    // Convert startDate to IST
    const istStartDate = moment
      .tz(startDate, "Asia/Kolkata")
      .startOf("day")
      .toISOString();
    // Convert endDate to IST
    const istEndDate = moment
      .tz(endDate, "Asia/Kolkata")
      .endOf("day")
      .toISOString();

    let gatewayFilter;
    if (gateway === "paythrough") {
      gatewayFilter = { $in: ["paythrough", "paythroughIntent"] };
    } else {
      gatewayFilter = gateway;
    }

    const userId = await getUserId(emailId);

    const result = await Transaction.aggregate([
      {
        $match: { uuid: userId, status: status },
      },
      {
        $addFields: {
          istTransactionDate: {
            $dateToString: {
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
              date: { $toDate: "$transaction_date" },
              timezone: "Asia/Kolkata",
            },
          },
        },
      },
      {
        $match: {
          $and: [
            { status: status },
            { gateway: gatewayFilter },
            { transaction_date: { $gte: istStartDate, $lte: istEndDate } },
            {
              $expr: {
                $and: [
                  {
                    $gte: [
                      "$istTransactionDate",
                      `${startDate}T${startTime}.000Z`,
                    ],
                  },
                  {
                    $lte: ["$istTransactionDate", `${endDate}T${endTime}.000Z`],
                  },
                ],
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$amount" },
          totalCount: { $sum: 1 }, // Count the number of transactions
        },
      },
    ]);

    // Access the total volume and total count directly
    const totalVolume = result[0] ? result[0].totalVolume : 0;
    const totalCount = result[0] ? result[0].totalCount : 0;

    return { totalVolume, totalCount };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// async function getTotalMerchantVolumeByDateWithTime(emailId,status, startDate, endDate, startTime, endTime) {
//   // Convert startDate to IST
//   const istStartDate = moment.tz(startDate, 'Asia/Kolkata').startOf('day').toISOString();
//   // Convert endDate to IST
//   const istEndDate = moment.tz(endDate, 'Asia/Kolkata').endOf('day').toISOString();

//   const result = await userDao.aggregate([
//     {
//       $match: { emailId: emailId }
//     },
//     {
//       $unwind: "$transactions"
//     },
//     {
//       $addFields: {
//         istTransactionDate: {
//           $dateToString: {
//             format: '%Y-%m-%dT%H:%M:%S.%LZ',
//             date: { $toDate: "$transactions.transaction_date" },
//             timezone: 'Asia/Kolkata'
//           }
//         }
//       }
//     },
//     {
//       $match: {
//         $and: [
//           { "transactions.status": status },
//           { "transactions.transaction_date": { $gte: istStartDate, $lte: istEndDate } },
//           {
//             $expr: {
//               $and: [
//                 { $gte: ["$istTransactionDate", `${startDate}T${startTime}.000Z`] },
//                 { $lte: ["$istTransactionDate", `${endDate}T${endTime}.000Z`] }
//               ]
//             }
//           }
//         ]
//       }
//     },
//     {
//       $group: {
//         _id: null,
//         totalVolume: { $sum: "$transactions.amount" },
//         totalCount: { $sum: 1 } // Count the number of transactions
//       }
//     }
//   ]);

//   // Access the total volume and total count directly
//   const totalVolume = result[0] ? result[0].totalVolume : 0;
//   const totalCount = result[0] ? result[0].totalCount : 0;

//   return { totalVolume, totalCount };
// }

async function getTotalMerchantVolumeByDateWithTime(
  emailId,
  status,
  startDate,
  endDate,
  startTime,
  endTime
) {
  try {
    // Convert startDate to IST
    const istStartDate = moment
      .tz(startDate, "Asia/Kolkata")
      .startOf("day")
      .toISOString();
    // Convert endDate to IST
    const istEndDate = moment
      .tz(endDate, "Asia/Kolkata")
      .endOf("day")
      .toISOString();

    const userId = await getUserId(emailId);

    const result = await Transaction.aggregate([
      {
        $match: { uuid: userId, status: status },
      },
      {
        $addFields: {
          istTransactionDate: {
            $dateToString: {
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
              date: { $toDate: "$transaction_date" },
              timezone: "Asia/Kolkata",
            },
          },
        },
      },
      {
        $match: {
          $and: [
            { transaction_date: { $gte: istStartDate, $lte: istEndDate } },
            {
              $expr: {
                $and: [
                  {
                    $gte: [
                      "$istTransactionDate",
                      `${startDate}T${startTime}.000Z`,
                    ],
                  },
                  {
                    $lte: ["$istTransactionDate", `${endDate}T${endTime}.000Z`],
                  },
                ],
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$amount" },
          totalCount: { $sum: 1 }, // Count the number of transactions
        },
      },
    ]);

    // Access the total volume and total count directly
    const totalVolume = result[0] ? result[0].totalVolume : 0;
    const totalCount = result[0] ? result[0].totalCount : 0;

    return { totalVolume, totalCount };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

/*
// transactionsModel.create({ transactions: reversed.reverse() }, function(err, result) {
                //     if (err) {
                //         console.error('Error inserting data:', err);
                //     } else {
                //         console.log('Data inserted successfully:', result);
                //     }
                
                //     // Close the connection after insertion
                // });
                //updateTransactionsData(reversed[0])
*/

module.exports = {
  updateTransactionsData,

  updateTransactionStatus,

  getAllTransactions,

  getAllTransactionsData,

  getAllMerchantTransactions,

  getTotalVolume,

  getDataById,

  getTransactionById,

  getTotalVolumeByGatewayAndStatus,

  getTotalVolumeByGatewayAndDate,

  getTotalVolumeByGatewayAndDateWithTime,

  getTransactionsByDate,

  getTransactionsByDateAndStatus,

  getTotalVolumeByDate,

  getTotalVolumeMerchant,

  getTotalVolumeMerchantWithGateway,

  getTotalMerchantVolumeByGatewayAndDate,

  getTotalMerchantVolumeByDate,

  getTotalMerchantVolumeByGatewayAndDateWithTime,

  getTotalMerchantVolumeByDateWithTime,

  getTotalVolumeByDateWithTime,

  getCompleteTransactions,
};

const dao = require("../adminDao");
const usrConst = require("../userConstants");
const mapper = require("../userMapper");
const appUtils = require("../../appUtils");
const { callbackPayin } = require("../../gateways/callback");
//const moment = require('moment');
const payoutDao = require("../payouts/payoutsDao");

const adminDao = require("../adminDao");
const {
  updateTransactionStatus,
} = require("../transactionDao");
const { getTransaction } = require("../transactionsDao/TransactionDao");
const { saveCallback } = require("./callbacksDao");
const { validateRequest } = require("../userService");

//payouts callback
async function pinwalletPayoutCallback(details) {
    console.log("pinwallet payout",details)
    if(details)
    {
    //   {
    //     "date": "",
    //     "amount": "100",
    //     "mobileNumber": "xxxxxxx893",
    //     "transaction_id": "xxxxxxxxx",
    //     "rrn": "xxxxxxxxxxxx",
    //     "description": "Transaction status success",
    //     "emailid": "xxx@xxx.com",
    //     "transactionId_type": "UPI/IMPS",
    //     "status": "success"
    // }
        const transaction = await payoutDao.getPayoutDataById(details?.transaction_id)
        if(transaction)
        {

          const updateObj ={ 
            status:details?.status,
            utr:details?.rrn
          }

          const updated = await payoutDao.updateTransactionStatus(details?.transaction_id,updateObj)
          if(updated)
          return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, "success")
          else
          return mapper.responseMappingWithData(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError, "unable to update transaction ")

        }else{
          return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)

        }
        

    }else{
        return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)

    }
}


async function cashfreePayoutCallback(details) {
  console.log("cashfree payout", details)
  // {
  //   0|apisandwich  |   event: 'TRANSFER_SUCCESS',
  //   0|apisandwich  |   transferId: '8158867948208',
  //   0|apisandwich  |   referenceId: '658421306',
  //   0|apisandwich  |   acknowledged: '1',
  //   0|apisandwich  |   eventTime: '2024-03-30 15:03:55',
  //   0|apisandwich  |   utr: '1711791235370536',
  //   0|apisandwich  |   signature: 'eM9UYhYP3IycB5hwj6iy+xZYNaeEu3NMmiQdVbVC6ow='
  //   0|apisandwich  | }
  if (details) {
    const Transaction = await payoutDao.getPayoutDataById(details?.transferId)
    const transaction = Transaction[0]?Transaction[0]:false
    // if (!transaction) {
    //   callbackPayin(details, "https://payhubsandbox.onrender.com/callback/cashfreePayoutStatus")
    //     .catch((error) => {
    //       console.log(error)
    //     })
    //   return { message: 'forwaded to sandbox' }
    // }
    if (transaction) {

      const updateObj = {
        status: details?.event?.toLowerCase() == 'transfer_success'?'success':'failed',
        utr: details?.utr ? details?.utr : ''
      }
      const txQuery = {
        transactionId: details?.transferId
      }
      const adminQuery = {
        emailId: 'samir123@payhub'
      }
      const user = await payoutDao.getUserDataByTxId(txQuery)
      const admin = await adminDao.getUserDetails(adminQuery)
      if (user) {
        const userQuery = {
          uuid: user?._id
        }
        if (details?.event?.toLowerCase() == 'transfer_success') {

          const updateObj = {
            payoutBalance: Number(user.payoutBalance) - Number(transaction?.amount),
            $set: {

              "payoutsData.last24hr": Number(user.payoutsData.last24hr) + Number(transaction?.amount),
              "payoutsData.last24hrSuccess": Number(user.payoutsData.last24hrSuccess) + 1,
              "payoutsData.last24hrTotal": Number(user.payoutsData.last24hrTotal) + 1,
              "payoutsData.totalTransactions": Number(user.payoutsData.totalTransactions) + 1,
              "payoutsData.successfulTransactions": Number(user.payoutsData.successfulTransactions) + 1,

            }
          }
          const adminUpdateObj = {
            payoutsBalance: Number(admin.payoutsBalance) - Number(transaction?.amount),
            $set: {

              "payouts.last24hr": Number(admin.payouts.last24hr) + Number(transaction?.amount),
              "payouts.last24hrSuccess": Number(admin.payouts.last24hrSuccess) + 1,
              "payouts.last24hrTotal": Number(admin.payouts.last24hrTotal) + 1,
              "payouts.totalTransactions": Number(admin.payouts.totalTransactions) + 1,
              "payouts.successfulTransactions": Number(admin.payouts.successfulTransactions) + 1,

            }
          }
          console.log(adminUpdateObj,updateObj,transaction)
          payoutDao.updateAdminProfile({ emailId: 'samir123@payhub' }, adminUpdateObj)
          payoutDao.updateUserProfile(userQuery, updateObj)

        } else {
          const updateObj = {
            $set: {

              "payoutsData.last24hrTotal": Number(user.payoutsData.last24hrTotal) + 1,
              "payoutsData.totalTransactions": Number(user.payoutsData.totalTransactions) + 1,

            }
          }
          const adminUpdateObj = {
            $set: {

              "payouts.last24hrTotal": Number(admin.payouts.last24hrTotal) + 1,
              "payouts.totalTransactions": Number(admin.payouts.totalTransactions) + 1,

            }
          }
          payoutDao.updateUserProfile(userQuery, updateObj)
          payoutDao.updateAdminProfile({ emailId: 'samir123@payhub' }, adminUpdateObj)

        }
      }
      if (user.payoutCallbackUrl) {
        const callBackDetails = {
          transaction_id: details?.transferId,
          amount: transaction?.amount,
          status: details?.event?.toLowerCase()=='transfer_success'?'success':"failed",
          transaction_date: transaction?.transaction_date

        }
        callbackPayin(callBackDetails, user.payoutCallbackUrl)
      }
      const updated = await payoutDao.updateTransactionStatus(details?.transferId, updateObj)
      if (updated)
        return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, "success")
      else
        return mapper.responseMappingWithData(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError, "unable to update transaction ")

    } else {
      return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)

    }


  } else {
    return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)

  }
}

//paytmePayouts
async function paytmePayoutCallback(details) {
  console.log("paytme payout",details)
  if(details)
    {
        const transaction = await payoutDao.getPayoutDataById(details?.transaction_id)
        if(transaction)
        {

          const updateObj ={ 
            status:details?.status,
            utr:details?.rrn?details?.rrn:''
          }
          const txQuery={
            transactionId:details?.transaction_id
          }
          const adminQuery={
            emailId:'samir123@payhub'
          }
          const user = await payoutDao.getUserDataByTxId(txQuery)
          const admin = await adminDao.getUserDetails(adminQuery)
          if(user)
          {
            const userQuery ={
              uuid:user?._id
            }
            if(details?.status?.toLowerCase()=='success')
            {

              const updateObj ={
                payoutBalance:Number(user.payoutBalance)-Number(details?.amount),
                $set:{
                  
                  "payoutsData.last24hr":Number(user.payoutsData.last24hr)+Number(details?.amount),
                 "payoutsData.last24hrSuccess":Number(user.payoutsData.last24hrSuccess)+1,
                 "payoutsData.last24hrTotal":Number(user.payoutsData.last24hrTotal)+1,
                 "payoutsData.totalTransactions":Number(user.payoutsData.totalTransactions)+1,
                 "payoutsData.successfulTransactions":Number(user.payoutsData.successfulTransactions)+1,
                  
                }
              }
              const adminUpdateObj ={
                payoutsBalance:Number(admin.payoutsBalance)-Number(details?.amount),
                $set:{
                  
                  "payouts.last24hr":Number(admin.payouts.last24hr)+Number(details?.amount),
                  "payouts.last24hrSuccess":Number(admin.payouts.last24hrSuccess)+1,
                  "payouts.last24hrTotal":Number(admin.payouts.last24hrTotal)+1,
                 "payouts.totalTransactions":Number(admin.payouts.totalTransactions)+1,
                 "payouts.successfulTransactions":Number(admin.payouts.successfulTransactions)+1,
                  
                }
              }
              payoutDao.updateAdminProfile({emailId:'samir123@payhub'},adminUpdateObj)
              payoutDao.updateUserProfile(userQuery,updateObj)
              
            }else{
              const updateObj ={
                $set:{
                  
                 "payoutsData.last24hrTotal":Number(user.payoutsData.last24hrTotal)+1,
                 "payoutsData.totalTransactions":Number(user.payoutsData.totalTransactions)+1,
                  
                }
              }
              const adminUpdateObj ={
                $set:{
                  
                  "payouts.last24hrTotal":Number(admin.payouts.last24hrTotal)+1,
                 "payouts.totalTransactions":Number(admin.payouts.totalTransactions)+1,
                  
                }
              }
              payoutDao.updateUserProfile(userQuery,updateObj)
              payoutDao.updateAdminProfile({emailId:'samir123@payhub'},adminUpdateObj)
              
            }
          }
          if(user.payoutCallbackUrl)
          {
            const callBackDetails ={
              transaction_id:details?.transaction_id,
              amount:details?.amount,
              status:details?.status?.toLowerCase(),
              transaction_date:transaction?.transaction_date

            }
            callbackPayin(callBackDetails,user.payoutCallbackUrl)
          }
          const updated = await payoutDao.updateTransactionStatus(details?.transaction_id,updateObj)
          if(updated)
          return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, "success")
          else
          return mapper.responseMappingWithData(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError, "unable to update transaction ")

        }else{
          return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)

        }
        

    }else{
        return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)

    }
}

//payins callbacks

// async function saveTxPaytme(details)
// {
//     console.log("paytme",details)
//     if (details) {
//         const query = {
//           transactionId: details.transaction_id,
//         };
//         let updateObj = {
//           status: details.status==1?'success':details.status==2?'failed':"pending",
//           utr: details.rrn,
//         };
//         let adminQuery = {
//           emailId: "samir123@payhub",
//         };
//         const transaction = await getTransaction(details.transaction_id);
//         // console.log(transaction)
//         const admin = await dao.getUserDetails(adminQuery);
//         const gatewayData = await adminDao.getGatewayDetails("paytmE");
//         //console.log(gatewayData);
//         if (details.amount && details.status == 1) {
//           //console.log('in here')
//           dao.getUserBalance2(query).then(async (response) => {
//             //console.log("My balance", response[0].balance);
//             const balance = response[0].balance;
//             const user24hr = response[0].last24hr;
//             const yesterday = response[0].yesterday;
//             const admin24hr = admin.last24hr;
//             const adminBalance = admin.balance;
//             let adminUpdate = {
//               last24hr: Number(admin24hr) + Number(details.amount),
//               balance: Number(adminBalance) + Number(details.amount),
//               totalTransactions: Number(admin.totalTransactions) + 1,
//               successfulTransactions: Number(admin.successfulTransactions) + 1,
//               last24hrSuccess: Number(admin.last24hrSuccess) + 1,
//               last24hrTotal: Number(admin.last24hrTotal) + 1,
//             };
//             const feeCollected =
//               Number(gatewayData.feeCollected24hr) +
//               (Number(response[0].platformFee) > 0
//                 ? Number(details.amount) * (Number(response[0].platformFee) / 100)
//                 : 0);
//             const totalFeeCollected =
//               Number(gatewayData.totalFeeCollected) +
//               (Number(response[0].platformFee) > 0
//                 ? Number(details.amount) * (Number(response[0].platformFee) / 100)
//                 : 0);
//             console.log(feeCollected, totalFeeCollected);
//             let gatewayUpdate = {
//               last24hr: Number(gatewayData.last24hr) + Number(details.amount),
//               last24hrSuccess: Number(gatewayData.last24hrSuccess) + 1,
//               successfulTransactions:
//                 Number(gatewayData.successfulTransactions) + 1,
//               totalVolume: Number(gatewayData.totalVolume) + Number(details.amount),
//               feeCollected24hr: feeCollected,
//               totalFeeCollected: totalFeeCollected,
//             };
//            // console.log("gateway update", gatewayUpdate);
    
//             let updateObj = {
//               balance: Number(details.amount) + Number(balance),
//               utr: details.rrn,
//               last24hr: Number(user24hr) + Number(details.amount),
//               totalTransactions: Number(response[0].totalTransactions) + 1,
//               successfulTransactions:
//                 Number(response[0].successfulTransactions) + 1,
//               last24hrSuccess: Number(response[0].last24hrSuccess) + 1,
//               last24hrTotal: Number(response[0].last24hrTotal) + 1,
//               todayFee:
//                 Number(response[0].platformFee) > 0
//                   ? Number(response[0].todayFee) +
//                     Number(details.amount) * (Number(response[0].platformFee) / 100)
//                   : 0,
//             };
//            // console.log("updateObj", updateObj);
//             const txData = {
//               transaction_id: transaction.transactionId,
//               amount: transaction.amount,
//               status: "success",
//               phone: transaction.phone,
//               username: transaction.username,
//               upiId: transaction.upiId,
//               utr: details.rrn,
//               transaction_date: transaction.transaction_date,
//             };
//             // console.log('txData',txData)
//             // console.log('encKey',response[0].encryptionKey)
//             const encryptedData = appUtils.encryptParameters(
//               JSON.stringify(txData),
//               response[0].encryptionKey
//             );
//             let callBackDetails = {
//               transaction_id: details.transaction_id,
//               status: "success",
//               amount: details.amount,
//               utr: details.rrn,
//               phone: transaction.phone,
//               username: transaction.username,
//               upiId: transaction.upiId,
//               date: transaction.transaction_date,
//               encryptedData: encryptedData,
//             };
//             console.log("callback details..", callBackDetails);
//              dao.updateProfile(adminQuery, adminUpdate);
//              dao.updateUserProfile2(query, updateObj);
//              dao.updateGatewayDetails("paytmE", gatewayUpdate);
    
//             callbackPayin(callBackDetails, response[0].callbackUrl).catch(
//               (e) => console.log(e)
//             );
    
//             // await enqueueUpdateTask(dao.updateProfile, adminQuery, adminUpdate);
//             // await enqueueUpdateTask(dao.updateUserProfile2, query, updateObj);
//             // await enqueueUpdateTask(dao.updateGatewayDetails, 'airpay', gatewayUpdate);
//           });
//           // updateObj.balance = details.PayerAmount
//           // let updatedBalance = details.balance
//           // updateObj.balance = updatedBalance
//           //  dao.updateProfile(query, updateObj)
//         } else if(details.status==2){
//           dao.getUserBalance2(query).then(async (response) => {
//             // console.log('My balance',response[0].balance)
//             // const balance = response[0].balance
//             // console.log(response[0].callbackUrl)
//             // console.log(balance)
    
//             // let updateObj = {
//             //     balance: Number(details.amount) + Number(balance)
//             // }
//             const txData = {
//               transaction_id: transaction.transactionId,
//               amount: transaction.amount,
//               status: "failed", //details.TRANSACTIONPAYMENTSTATUS,
//               phone: transaction.phone,
//               username: transaction.username,
//               upiId: transaction.upiId,
//               utr: details.rrn,
//               transaction_date: transaction.transaction_date,
//             };
//             // console.log('txData',txData)
//             // console.log('encKey',response[0].encryptionKey)
//             const encryptedData = appUtils.encryptParameters(
//               JSON.stringify(txData),
//               response[0].encryptionKey
//             );
//             let callBackDetails = {
//               transaction_id: details.transaction_id,
//               status: "failed", //details.TRANSACTIONPAYMENTSTATUS,
//               amount: details.amount,
//               utr: details.rrn ? details.rrn : "",
//               phone: transaction.phone,
//               username: transaction.username,
//               upiId: transaction.upiId,
//               date: transaction.transaction_date,
//               encryptedData: encryptedData,
//             };
    
//             //console.log('callback details', callBackDetails)
//             let adminUpdate = {
//               totalTransactions: Number(admin.totalTransactions) + 1,
//               last24hrTotal: Number(admin.last24hrTotal) + 1,
//             };
//             updateObj.totalTransactions = Number(response[0].totalTransactions) + 1;
//             updateObj.last24hrTotal = Number(response[0].last24hrTotal) + 1
//               dao.updateProfile(adminQuery, adminUpdate);
    
//             dao.updateUserProfile2(query, updateObj);
    
//              callbackPayin(callBackDetails, response[0].callbackUrl);
//             // await enqueueUpdateTask(dao.updateProfile, adminQuery, adminUpdate);
//             // await enqueueUpdateTask(dao.updateUserProfile2, query, updateObj);
//           });
//         }
       
//         saveCallback(details.transaction_id,'paytmE',details)

//         return  updateTransactionStatus(details.transaction_id, updateObj)
//         // dao
//         //   .updateTransactions(query, details.APTRANSACTIONID, updateObj)
//           .then((userUpdated) => {
//             if (userUpdated) {
//               //console.log('success', userUpdated)
    
//               return mapper.responseMappingWithData(
//                 usrConst.CODE.Success,
//                 usrConst.MESSAGE.Success,
//                 "success"
//               );
//             } else {
//               console.log("Failed to update ");
//               return mapper.responseMapping(
//                 usrConst.CODE.INTRNLSRVR,
//                 usrConst.MESSAGE.internalServerError
//               );
//             }
//           });
//       } else {
//         return mapper.responseMapping(usrConst.CODE.BadRequest, "invalid details");
//       }
// }
async function saveTxPaytme(details) {
  console.log("paytme", details);
  if (details) {
      const query = {
          transactionId: details.transaction_id,
      };
      let updateObj = {
          status: details.status == 1 ? 'success' : details.status == 2 ? 'failed' : "pending",
          utr: details.rrn,
      };
      let adminQuery = {
          emailId: "samir123@payhub",
      };
      const transaction = await getTransaction(details.transaction_id);
      const admin = await dao.getUserDetails(adminQuery);
      const gatewayData = await adminDao.getGatewayDetails("paytmE");
      const response = await dao.getUserBalance2(query);
      if (details.amount && details.status == 1) {
          const balance = response[0].balance;
          const user24hr = response[0].last24hr;
          const yesterday = response[0].yesterday;
          const admin24hr = admin.last24hr;
          const adminBalance = admin.balance;
          let adminUpdate = {
              last24hr: Number(admin24hr) + Number(details.amount),
              balance: Number(adminBalance) + Number(details.amount),
              totalTransactions: Number(admin.totalTransactions) + 1,
              successfulTransactions: Number(admin.successfulTransactions) + 1,
              last24hrSuccess: Number(admin.last24hrSuccess) + 1,
              last24hrTotal: Number(admin.last24hrTotal) + 1,
          };
          const feeCollected =
              Number(gatewayData.feeCollected24hr) +
              (Number(response[0].platformFee) > 0 ? Number(details.amount) * (Number(response[0].platformFee) / 100) : 0);
          const totalFeeCollected =
              Number(gatewayData.totalFeeCollected) +
              (Number(response[0].platformFee) > 0 ? Number(details.amount) * (Number(response[0].platformFee) / 100) : 0);
          console.log(feeCollected, totalFeeCollected);
          let gatewayUpdate = {
              last24hr: Number(gatewayData.last24hr) + Number(details.amount),
              last24hrSuccess: Number(gatewayData.last24hrSuccess) + 1,
              successfulTransactions: Number(gatewayData.successfulTransactions) + 1,
              totalVolume: Number(gatewayData.totalVolume) + Number(details.amount),
              feeCollected24hr: feeCollected,
              totalFeeCollected: totalFeeCollected,
          };
          let updateObj = {
              balance: Number(details.amount) + Number(balance),
              utr: details.rrn,
              last24hr: Number(user24hr) + Number(details.amount),
              totalTransactions: Number(response[0].totalTransactions) + 1,
              successfulTransactions: Number(response[0].successfulTransactions) + 1,
              last24hrSuccess: Number(response[0].last24hrSuccess) + 1,
              last24hrTotal: Number(response[0].last24hrTotal) + 1,
              todayFee: Number(response[0].platformFee) > 0 ? Number(response[0].todayFee) +
                  Number(details.amount) * (Number(response[0].platformFee) / 100) : 0,
          };
          const txData = {
              transaction_id: transaction.transactionId,
              amount: transaction.amount,
              status: "success",
              phone: transaction.phone,
              username: transaction.username,
              upiId: transaction.upiId,
              utr: details.rrn,
              transaction_date: transaction.transaction_date,
          };
          const encryptedData = appUtils.encryptParameters(JSON.stringify(txData), response[0].encryptionKey);
          let callBackDetails = {
              transaction_id: details.transaction_id,
              status: "success",
              amount: details.amount,
              utr: details.rrn,
              phone: transaction.phone,
              username: transaction.username,
              upiId: transaction.upiId,
              date: transaction.transaction_date,
              encryptedData: encryptedData,
          };
          console.log("callback details..", callBackDetails);
          await dao.updateProfile(adminQuery, adminUpdate);
          await dao.updateUserProfile2(query, updateObj);
          await dao.updateGatewayDetails("paytmE", gatewayUpdate);

          callbackPayin(callBackDetails, response[0].callbackUrl).catch((e) => console.log(e));
      } else if (details.status == 2) {
          //const response = await dao.getUserBalance2(query);
          const txData = {
              transaction_id: transaction.transactionId,
              amount: transaction.amount,
              status: "failed",
              phone: transaction.phone,
              username: transaction.username,
              upiId: transaction.upiId,
              utr: details.rrn,
              transaction_date: transaction.transaction_date,
          };
          const encryptedData = appUtils.encryptParameters(JSON.stringify(txData), response[0].encryptionKey);
          let callBackDetails = {
              transaction_id: details.transaction_id,
              status: "failed",
              amount: details.amount,
              utr: details.rrn ? details.rrn : "",
              phone: transaction.phone,
              username: transaction.username,
              upiId: transaction.upiId,
              date: transaction.transaction_date,
              encryptedData: encryptedData,
          };
          let adminUpdate = {
              totalTransactions: Number(admin.totalTransactions) + 1,
              last24hrTotal: Number(admin.last24hrTotal) + 1,
          };
          updateObj.totalTransactions = Number(response[0].totalTransactions) + 1;
          updateObj.last24hrTotal = Number(response[0].last24hrTotal) + 1;
          await dao.updateProfile(adminQuery, adminUpdate);
          await dao.updateUserProfile2(query, updateObj);
          callbackPayin(callBackDetails, response[0].callbackUrl);
      }

      saveCallback(details.transaction_id, 'paytmE', details)

      return updateTransactionStatus(details.transaction_id, updateObj);
  } else {
      return mapper.responseMapping(usrConst.CODE.BadRequest, "invalid details");
  }
}

//autoCallback
async function autoCallback(details) {
  //console.log("paytme", details);
  return validateRequest(details).then(async (response) => {
    if (response == true) {  
      if (details) {
      const query = {
          transactionId: details.transaction_id,
      };
      let updateObj = {
          status: details.status == "success" ? 'success' : details.status == "failed" ? 'failed' : "pending",
          utr: Math.floor(Math.random()*9000000000) + 10000000000
      };
      let adminQuery = {
          emailId: "samir123@payhub",
      };
      const transaction = await getTransaction(details.transaction_id);
      const admin = await dao.getUserDetails(adminQuery);
      const gatewayData = await adminDao.getGatewayDetails("bazarpay");
      const response = await dao.getUserBalance2(query);
      if (details.amount && details.status =="success") {
          const balance = response[0].balance;
          const user24hr = response[0].last24hr;
          const yesterday = response[0].yesterday;
          const admin24hr = admin.last24hr;
          const adminBalance = admin.balance;
          let adminUpdate = {
              last24hr: Number(admin24hr) + Number(details.amount),
              balance: Number(adminBalance) + Number(details.amount),
              totalTransactions: Number(admin.totalTransactions) + 1,
              successfulTransactions: Number(admin.successfulTransactions) + 1,
              last24hrSuccess: Number(admin.last24hrSuccess) + 1,
              last24hrTotal: Number(admin.last24hrTotal) + 1,
          };
          const feeCollected =
              Number(gatewayData.feeCollected24hr) +
              (Number(response[0].platformFee) > 0 ? Number(details.amount) * (Number(response[0].platformFee) / 100) : 0);
          const totalFeeCollected =
              Number(gatewayData.totalFeeCollected) +
              (Number(response[0].platformFee) > 0 ? Number(details.amount) * (Number(response[0].platformFee) / 100) : 0);
          console.log(feeCollected, totalFeeCollected);
          let gatewayUpdate = {
              last24hr: Number(gatewayData.last24hr) + Number(details.amount),
              last24hrSuccess: Number(gatewayData.last24hrSuccess) + 1,
              successfulTransactions: Number(gatewayData.successfulTransactions) + 1,
              totalVolume: Number(gatewayData.totalVolume) + Number(details.amount),
              feeCollected24hr: feeCollected,
              totalFeeCollected: totalFeeCollected,
          };
          let updateObj = {
              balance: Number(details.amount) + Number(balance),
              utr: details.rrn,
              last24hr: Number(user24hr) + Number(details.amount),
              totalTransactions: Number(response[0].totalTransactions) + 1,
              successfulTransactions: Number(response[0].successfulTransactions) + 1,
              last24hrSuccess: Number(response[0].last24hrSuccess) + 1,
              last24hrTotal: Number(response[0].last24hrTotal) + 1,
              todayFee: Number(response[0].platformFee) > 0 ? Number(response[0].todayFee) +
                  Number(details.amount) * (Number(response[0].platformFee) / 100) : 0,
          };
          const txData = {
              transaction_id: transaction.transactionId,
              amount: transaction.amount,
              status: "success",
              phone: transaction.phone,
              username: transaction.username,
              upiId: transaction.upiId,
              utr: details.rrn,
              transaction_date: transaction.transaction_date,
          };
          const encryptedData = appUtils.encryptParameters(JSON.stringify(txData), response[0].encryptionKey);
          let callBackDetails = {
              transaction_id: details.transaction_id,
              status: "success",
              amount: details.amount,
              utr: details.rrn,
              phone: transaction.phone,
              username: transaction.username,
              upiId: transaction.upiId,
              date: transaction.transaction_date,
              encryptedData: encryptedData,
          };
          console.log("callback details..", callBackDetails);
          await dao.updateProfile(adminQuery, adminUpdate);
          await dao.updateUserProfile2(query, updateObj);
          await dao.updateGatewayDetails("paytmE", gatewayUpdate);

          callbackPayin(callBackDetails, response[0].callbackUrl).catch((e) => console.log(e));
      } else if (details.status == "failed") {
          //const response = await dao.getUserBalance2(query);
          const txData = {
              transaction_id: transaction.transactionId,
              amount: transaction.amount,
              status: "failed",
              phone: transaction.phone,
              username: transaction.username,
              upiId: transaction.upiId,
              utr: details.rrn,
              transaction_date: transaction.transaction_date,
          };
          const encryptedData = appUtils.encryptParameters(JSON.stringify(txData), response[0].encryptionKey);
          let callBackDetails = {
              transaction_id: details.transaction_id,
              status: "failed",
              amount: details.amount,
              utr: details.rrn ? details.rrn : "",
              phone: transaction.phone,
              username: transaction.username,
              upiId: transaction.upiId,
              date: transaction.transaction_date,
              encryptedData: encryptedData,
          };
          let adminUpdate = {
              totalTransactions: Number(admin.totalTransactions) + 1,
              last24hrTotal: Number(admin.last24hrTotal) + 1,
          };
          updateObj.totalTransactions = Number(response[0].totalTransactions) + 1;
          updateObj.last24hrTotal = Number(response[0].last24hrTotal) + 1;
          await dao.updateProfile(adminQuery, adminUpdate);
          await dao.updateUserProfile2(query, updateObj);
          callbackPayin(callBackDetails, response[0].callbackUrl);
      }

      saveCallback(details.transaction_id, 'auto', details)

      updateTransactionStatus(details.transaction_id, updateObj);
      return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, "Callback Processed Successfully ")
    } else {
      return mapper.responseMapping(usrConst.CODE.BadRequest, "invalid details");
  }
} else if (response == false) {
  return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
} else {
  return mapper.responseMapping(usrConst.CODE.BadRequest, response);
}
});
}

async function autoCallbackPayout(details) {
  //console.log("paytme payout",details)
  if(details)
    {
        const transaction = await payoutDao.getPayoutDataById(details?.transaction_id)
        if(transaction)
        {

          const updateObj ={ 
            status:details?.status,
            utr:Math.floor(Math.random()*9000000000) + 10000000000
          }
          const txQuery={
            transactionId:details?.transaction_id
          }
          const adminQuery={
            emailId:'samir123@payhub'
          }
          const user = await payoutDao.getUserDataByTxId(txQuery)
          const admin = await adminDao.getUserDetails(adminQuery)
          if(user)
          {
            const userQuery ={
              uuid:user?._id
            }
            if(details?.status?.toLowerCase()=='success')
            {

              const updateObj ={
                payoutBalance:Number(user.payoutBalance)-Number(details?.amount),
                $set:{
                  
                  "payoutsData.last24hr":Number(user.payoutsData.last24hr)+Number(details?.amount),
                 "payoutsData.last24hrSuccess":Number(user.payoutsData.last24hrSuccess)+1,
                 "payoutsData.last24hrTotal":Number(user.payoutsData.last24hrTotal)+1,
                 "payoutsData.totalTransactions":Number(user.payoutsData.totalTransactions)+1,
                 "payoutsData.successfulTransactions":Number(user.payoutsData.successfulTransactions)+1,
                  
                }
              }
              const adminUpdateObj ={
                payoutsBalance:Number(admin.payoutsBalance)-Number(details?.amount),
                $set:{
                  
                  "payouts.last24hr":Number(admin.payouts.last24hr)+Number(details?.amount),
                  "payouts.last24hrSuccess":Number(admin.payouts.last24hrSuccess)+1,
                  "payouts.last24hrTotal":Number(admin.payouts.last24hrTotal)+1,
                 "payouts.totalTransactions":Number(admin.payouts.totalTransactions)+1,
                 "payouts.successfulTransactions":Number(admin.payouts.successfulTransactions)+1,
                  
                }
              }
              payoutDao.updateAdminProfile({emailId:'samir123@payhub'},adminUpdateObj)
              payoutDao.updateUserProfile(userQuery,updateObj)
              
            }else{
              const updateObj ={
                $set:{
                  
                 "payoutsData.last24hrTotal":Number(user.payoutsData.last24hrTotal)+1,
                 "payoutsData.totalTransactions":Number(user.payoutsData.totalTransactions)+1,
                  
                }
              }
              const adminUpdateObj ={
                $set:{
                  
                  "payouts.last24hrTotal":Number(admin.payouts.last24hrTotal)+1,
                 "payouts.totalTransactions":Number(admin.payouts.totalTransactions)+1,
                  
                }
              }
              payoutDao.updateUserProfile(userQuery,updateObj)
              payoutDao.updateAdminProfile({emailId:'samir123@payhub'},adminUpdateObj)
              
            }
          }
          if(user.payoutCallbackUrl)
          {
            const callBackDetails ={
              transaction_id:details?.transaction_id,
              amount:details?.amount,
              status:details?.status?.toLowerCase(),
              transaction_date:transaction?.transaction_date

            }
            callbackPayin(callBackDetails,user.payoutCallbackUrl)
          }
          const updated = await payoutDao.updateTransactionStatus(details?.transaction_id,updateObj)
          if(updated)
          return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, "success")
          else
          return mapper.responseMappingWithData(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError, "unable to update transaction ")

        }else{
          return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)

        }
        

    }else{
        return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)

    }
}
module.exports ={
    pinwalletPayoutCallback,

    paytmePayoutCallback,

    saveTxPaytme,

    autoCallback,

    autoCallbackPayout,

    cashfreePayoutCallback
}
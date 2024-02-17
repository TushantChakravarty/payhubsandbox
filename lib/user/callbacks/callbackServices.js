const dao = require("../adminDao");
const usrConst = require("../userConstants");
const mapper = require("../userMapper");
const appUtils = require("../../appUtils");
const { callbackPayin } = require("../../gateways/callback");
//const moment = require('moment');

const adminDao = require("../adminDao");
const {
  updateTransactionStatus,
} = require("../transactionDao");
const { getTransaction } = require("../transactionsDao/TransactionDao");
const { saveCallback } = require("./callbacksDao");

//payouts callback
async function pinwalletPayoutCallback(details) {
    console.log("pinwallet payout",details)
    if(details)
    {
        return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, "success")

    }else{
        return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)

    }
}

//paytmePayouts
async function paytmePayoutCallback(details) {
  console.log("paytme payout",details)
  if(details)
  {
      return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, "success")

  }else{
      return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)

  }
}

//payins callbacks

async function saveTxPaytme(details)
{
    console.log("paytme",details)
    if (details) {
        const query = {
          transactionId: details.transaction_id,
        };
        let updateObj = {
          status: details.status==1?'success':details.status==2?'failed':"pending",
          utr: details.rrn,
        };
        let adminQuery = {
          emailId: "samir123@payhub",
        };
        const transaction = await getTransaction(details.transaction_id);
        // console.log(transaction)
        const admin = await dao.getUserDetails(adminQuery);
        const gatewayData = await adminDao.getGatewayDetails("paytmE");
        //console.log(gatewayData);
        if (details.amount && details.status == 1) {
          //console.log('in here')
          dao.getUserBalance2(query).then(async (response) => {
            //console.log("My balance", response[0].balance);
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
              (Number(response[0].platformFee) > 0
                ? Number(details.amount) * (Number(response[0].platformFee) / 100)
                : 0);
            const totalFeeCollected =
              Number(gatewayData.totalFeeCollected) +
              (Number(response[0].platformFee) > 0
                ? Number(details.amount) * (Number(response[0].platformFee) / 100)
                : 0);
            console.log(feeCollected, totalFeeCollected);
            let gatewayUpdate = {
              last24hr: Number(gatewayData.last24hr) + Number(details.amount),
              last24hrSuccess: Number(gatewayData.last24hrSuccess) + 1,
              successfulTransactions:
                Number(gatewayData.successfulTransactions) + 1,
              totalVolume: Number(gatewayData.totalVolume) + Number(details.amount),
              feeCollected24hr: feeCollected,
              totalFeeCollected: totalFeeCollected,
            };
           // console.log("gateway update", gatewayUpdate);
    
            let updateObj = {
              balance: Number(details.amount) + Number(balance),
              utr: details.rrn,
              last24hr: Number(user24hr) + Number(details.amount),
              totalTransactions: Number(response[0].totalTransactions) + 1,
              successfulTransactions:
                Number(response[0].successfulTransactions) + 1,
              last24hrSuccess: Number(response[0].last24hrSuccess) + 1,
              last24hrTotal: Number(response[0].last24hrTotal) + 1,
              todayFee:
                Number(response[0].platformFee) > 0
                  ? Number(response[0].todayFee) +
                    Number(details.amount) * (Number(response[0].platformFee) / 100)
                  : 0,
            };
           // console.log("updateObj", updateObj);
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
            // console.log('txData',txData)
            // console.log('encKey',response[0].encryptionKey)
            const encryptedData = appUtils.encryptParameters(
              JSON.stringify(txData),
              response[0].encryptionKey
            );
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
             dao.updateProfile(adminQuery, adminUpdate);
             dao.updateUserProfile2(query, updateObj);
             dao.updateGatewayDetails("paytmE", gatewayUpdate);
    
            callbackPayin(callBackDetails, response[0].callbackUrl).catch(
              (e) => console.log(e)
            );
    
            // await enqueueUpdateTask(dao.updateProfile, adminQuery, adminUpdate);
            // await enqueueUpdateTask(dao.updateUserProfile2, query, updateObj);
            // await enqueueUpdateTask(dao.updateGatewayDetails, 'airpay', gatewayUpdate);
          });
          // updateObj.balance = details.PayerAmount
          // let updatedBalance = details.balance
          // updateObj.balance = updatedBalance
          //  dao.updateProfile(query, updateObj)
        } else if(details.status==2){
          dao.getUserBalance2(query).then(async (response) => {
            // console.log('My balance',response[0].balance)
            // const balance = response[0].balance
            // console.log(response[0].callbackUrl)
            // console.log(balance)
    
            // let updateObj = {
            //     balance: Number(details.amount) + Number(balance)
            // }
            const txData = {
              transaction_id: transaction.transactionId,
              amount: transaction.amount,
              status: "failed", //details.TRANSACTIONPAYMENTSTATUS,
              phone: transaction.phone,
              username: transaction.username,
              upiId: transaction.upiId,
              utr: details.rrn,
              transaction_date: transaction.transaction_date,
            };
            // console.log('txData',txData)
            // console.log('encKey',response[0].encryptionKey)
            const encryptedData = appUtils.encryptParameters(
              JSON.stringify(txData),
              response[0].encryptionKey
            );
            let callBackDetails = {
              transaction_id: details.transaction_id,
              status: "failed", //details.TRANSACTIONPAYMENTSTATUS,
              amount: details.amount,
              utr: details.rrn ? details.rrn : "",
              phone: transaction.phone,
              username: transaction.username,
              upiId: transaction.upiId,
              date: transaction.transaction_date,
              encryptedData: encryptedData,
            };
    
            //console.log('callback details', callBackDetails)
            let adminUpdate = {
              totalTransactions: Number(admin.totalTransactions) + 1,
              last24hrTotal: Number(admin.last24hrTotal) + 1,
            };
            updateObj.totalTransactions = Number(response[0].totalTransactions) + 1;
            updateObj.last24hrTotal = Number(response[0].last24hrTotal) + 1
              dao.updateProfile(adminQuery, adminUpdate);
    
            dao.updateUserProfile2(query, updateObj);
    
             callbackPayin(callBackDetails, response[0].callbackUrl);
            // await enqueueUpdateTask(dao.updateProfile, adminQuery, adminUpdate);
            // await enqueueUpdateTask(dao.updateUserProfile2, query, updateObj);
          });
        }
       
        saveCallback(details.transaction_id,'paytmE',details)

        return  updateTransactionStatus(details.transaction_id, updateObj)
        // dao
        //   .updateTransactions(query, details.APTRANSACTIONID, updateObj)
          .then((userUpdated) => {
            if (userUpdated) {
              //console.log('success', userUpdated)
    
              return mapper.responseMappingWithData(
                usrConst.CODE.Success,
                usrConst.MESSAGE.Success,
                "success"
              );
            } else {
              console.log("Failed to update ");
              return mapper.responseMapping(
                usrConst.CODE.INTRNLSRVR,
                usrConst.MESSAGE.internalServerError
              );
            }
          });
      } else {
        return mapper.responseMapping(usrConst.CODE.BadRequest, "invalid details");
      }
}

module.exports ={
    pinwalletPayoutCallback,

    paytmePayoutCallback,

    saveTxPaytme
}
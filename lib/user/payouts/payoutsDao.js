const mongoose = require('mongoose')
let BaseDao = require('../../dao/BaseDao')
const Admin = require('../../generic/models/adminModel')
const user =  require('../../generic/models/userModel');
const { PayoutTransaction } = require('../../generic/models/TransactionData');
const adminDao = new BaseDao(Admin);
const usrDao = new BaseDao(user)
const ObjectId = require('mongoose').Types.ObjectId;
const moment = require('moment-timezone');


/*#################################            Load modules end            ########################################### */


/**
 * Get user details
 * @param {Object} query query to find user details
 */
async function getAdminDetails(query) {
    
    return adminDao.findOne(query)
}


function getUserDetails(query) {
    

    return usrDao.findOne(query)
}

async function createTransaction(tx)
{
    const newTransaction = new PayoutTransaction(tx);
    
    // Save the transaction
    newTransaction.save()
        .then(transaction => {
            // Create a main document with a reference to the transaction
            // const mainDoc = new MainModel({
            //     transactions: [transaction._id]
            // });
    
            // // Save the main document
            // return mainDoc.save();
        })
        .then(mainDoc => {
            //console.log('Main document with reference to transaction saved:', mainDoc);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

async function getAllTransactionsPayout(query) {
    try {
      const paginatedTransactions = await PayoutTransaction.aggregate([
        {
          $sort: { _id: -1 } // Assuming _id is a sortable field
        },
        {
          $skip: query.skip
        },
        {
          $limit: query.limit
        }
      ]);
  
      return paginatedTransactions;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async function getAllMerchantPayouts(query) {
    try {
      const User = await usrDao.findOne({
        emailId: query?.emailId,
      });
      const uuid = User._id
      const paginatedTransactions = await PayoutTransaction.aggregate([
        {
          $match:{
            uuid:String(uuid)
          }
        },
        {
          $sort: { _id: -1 } // Assuming _id is a sortable field
        },
        {
          $skip: query.skip
        },
        {
          $limit: query.limit
        }
      ]);
  
      return paginatedTransactions;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async function getPayoutDataById(id) {
    try {
      const result = await PayoutTransaction.findOne({
        $or: [
          { transactionId: id },
          { utr: id }
        ]
      });
  
      return result?[result]:[];
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async function getPayoutsByDate(startDate, endDate) {
    try {
      // Convert startDate to IST
      const istStartDate = moment.tz(startDate, 'Asia/Kolkata').startOf('day').toISOString();
      // Convert endDate to IST
      const istEndDate = moment.tz(endDate, 'Asia/Kolkata').endOf('day').toISOString();
  
      const result = await PayoutTransaction.aggregate([
        {
          $match: {
            "transaction_date": { $gte: istStartDate, $lte: istEndDate }
          }
        }
      ]);
  
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async function getPayoutsByStatus(status,limit,skip) {
    try {
      // Convert startDate to IST
   
  
      const result = await PayoutTransaction.aggregate([
        {
          $match: {
            "status":status
          }
        },
        {
          $skip:skip
        },
        {
          $limit:limit
        }
      ]);
  
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }


  async function getPayoutsByDateMerchant(startDate, endDate, emailId) {
    try {
      // Convert startDate to IST'
      const User = await usrDao.findOne({
        emailId: emailId,
      });
      const uuid = User._id
      
      const istStartDate = moment.tz(startDate, 'Asia/Kolkata').startOf('day').toISOString();
      // Convert endDate to IST
      const istEndDate = moment.tz(endDate, 'Asia/Kolkata').endOf('day').toISOString();
  
      const result = await PayoutTransaction.aggregate([
        {
          $match: {
            "uuid":String(uuid),
            "transaction_date": { $gte: istStartDate, $lte: istEndDate }
          }
        }
      ]);
  
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async function getPayoutsByStatusMerchant(emailId, status,limit,skip) {
    try {
      // Convert startDate to IST'
      const User = await usrDao.findOne({
        emailId: emailId,
      });
      const uuid = User._id
      
     
      const result = await PayoutTransaction.aggregate([
        {
          $match: {
            "uuid":String(uuid),
            "status":status
          }
        },
        {
          $skip:skip
        },
        {
          $limit:limit
        }
      ]);
  
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async function getPayoutsByDateWithStatusMerchant(startDate, endDate, emailId, status) {
    try {
      // Convert startDate to IST'
      const User = await usrDao.findOne({
        emailId: emailId,
      });
      const uuid = User._id
      
      const istStartDate = moment.tz(startDate, 'Asia/Kolkata').startOf('day').toISOString();
      // Convert endDate to IST
      const istEndDate = moment.tz(endDate, 'Asia/Kolkata').endOf('day').toISOString();
  
      const result = await PayoutTransaction.aggregate([
        {
          $match: {
            "uuid":String(uuid),
            "transaction_date": { $gte: istStartDate, $lte: istEndDate },
            "status":status
          }
        }
      ]);
  
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }


  async function getPayoutsByDateWithStatus(startDate, endDate, status) {
    try {
      // Convert startDate to IST
      const istStartDate = moment.tz(startDate, 'Asia/Kolkata').startOf('day').toISOString();
      // Convert endDate to IST
      const istEndDate = moment.tz(endDate, 'Asia/Kolkata').endOf('day').toISOString();
  
      const result = await PayoutTransaction.aggregate([
        {
          $match: {
            "transaction_date": { $gte: istStartDate, $lte: istEndDate },
            "status":status
          }
        }
      ]);
  
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  


module.exports = {

 
    getAdminDetails,

    getUserDetails,

    createTransaction,

    getAllTransactionsPayout,

    getPayoutDataById,

    getPayoutsByDate,

    getPayoutsByDateWithStatus,

    getPayoutsByDateMerchant,

    getAllMerchantPayouts,

    getPayoutsByDateWithStatusMerchant,

    getPayoutsByStatus,

    getPayoutsByStatusMerchant

}
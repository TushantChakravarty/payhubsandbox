const dao = require('../userDao')
const adminDao = require('../adminDao')
const { getAllUserTx } = require('../adminService')
const { pushDataForToday, fetchDataForCurrentDate } = require('../gatewayDao')
const { fetchTransactionStatusSwipeline } = require('../../gateways/swipeline')
const { getTransactionsSummaryYesterday } = require('../transactionsDao/TransactionDao')

const getPendingTx = async ()=>{
  const tx = await adminDao.getAllTransactionWithPendingStatus('IN-PROCESS')
  console.log(tx)
  const details ={
    "mid":"SLCOS000019DELH",
    "orderNo": "01575616246915714205"
  }
  const status = await fetchTransactionStatusSwipeline(details)
  console.log(status)
}

async function pushGatewayDetails()
{
  const admin = await adminDao.getUserDetails({
    emailId: 'samir123@payhub'
  });
  
  for (const item of admin.gateways) {
    await pushDataForToday(item);
  }
  //console.log(data)
  //  const data =await fetchDataForCurrentDate()
  //  console.log(data)
}

async function updateGatewayDetails(){
  // const admin = await adminDao.getUserDetails({
  //   emailId: 'samir123@payhub'
  // });
  
  const data = await fetchDataForCurrentDate();
  
  for (const item of data) {
    const body = {
      yesterday: item.last24hr,
      yesterdayFee: item.feeCollected24hr,
      yesterdayTransactions: item.last24hrSuccess
    };
  
    // console.log('body', body);
  
    await adminDao.updateGateway(item.gatewayName, body);
  }
}


async function updateUser()
{
  const users = await dao.getAllUsersTransactions()
  // console.log(users)
  users.map((item)=>{
    const last24 = item.last24hr
   
    let query= {
      emailId:item.emailId
    }
    let updateObj ={
      last24hr:0,
      yesterday:last24,
      last24hrSuccess:0,
      last24hrTotal:0,
      todayFee:0,
      yesterdayFee:item.todayFee,
      yesterdayTransactions:item.last24hrSuccess
    }
    //console.log(last24,yesterday)
    dao.updateProfile(query,updateObj)
  })
}
async function updateAdmin() {
  // const data = await adminDao.getAllTransactions({
  //   emailId: 'samir123@payhub'
  // });
  //console.log(data);
  const user = await getTransactionsSummaryYesterday()
  console.log(user)
  const updateObj = {
    last24hr: 0,
    yesterday:user?.totalAmount,
    last24hrSuccess:0,
    last24hrTotal:0,
    feeCollected24hr:0,
    //yesterdayTransactions:data?.last24hrSuccess
   
  };
  let query = {
    emailId: 'samir123@payhub'
  };
  
  adminDao.updateProfile(query, updateObj);
}

async function myFunction() {
  console.log('This is myFunction being executed.');

  updateUser();

  // Wrap the updateAdmin call in a try-catch block to handle any potential errors
  try {
    updateAdmin()
    pushGatewayDetails()
    .then(()=>{

      updateGatewayDetails()
    })
    
  } catch (error) {
    
    console.error('Error updating admin:', error);
  }
}

  module.exports = {
    updateAdmin,
    myFunction,
    pushGatewayDetails,
    updateGatewayDetails,
    getPendingTx
    };
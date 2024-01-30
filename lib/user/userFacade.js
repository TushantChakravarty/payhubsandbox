

/*#################################            Load modules start            ########################################### */
const service = require('./userService')

/*#################################            Load modules end            ########################################### */





/**
 * Register user
 * @param {Object} details user details to get registered
 */
function register(details) {

    return service.register(details).then(data => data)
}

function CheckWallet(details){
       
    return service.CheckWallet(details).then(data => data)
}

/**
 * Verify security code for registeration
 * @param {String} id mongo id of user
 * @param {String} code security code to be verified
 */
 function confirmOtp( details) {

    return service.confirmOtp( details).then(data => data)
}

function getBalance( details) {

    return service.getBalance( details).then(data => data)
}

function getAllBalances( details) {

    return service.getAllBalances( details).then(data => data)
}

function Balance( details) {

    return service.Balance( details).then(data => data)
}


/**
 * Verify security code
 * @param {String} id mongo id of user
 * @param {String} code security code to be verified
 */
function verifySecurityCode(id, details) {

    return service.verifySecurityCode(id, details).then(data => data)
}

/**
 * Resend verification code
 * @param {String} id mongo id of user
 * @param {Object} details email id or contact number on which verification code is to be sent
 */
function resendCode(id, details) {

    return service.resendCode(id, details).then(data => data)
}

/**
 * Login
 * @param {Object} details user details
 */
function login(details) {

    return service.login(details).then(data => data)
}

function resetPassword(details) {

    return service.resetPassword(details).then(data => data)
}

function updateProfile(details) {

    return service.updateProfile(details).then(data => data)
}

function sendPaymentRequest(details) {

    return service.sendPaymentRequest(details).then(data => data)
}

function sendPayinRequest(details) {

    return service.sendPayinRequest(details).then(data => data)
}

function getAllUserTransactions(details) {

    return service.getAllUserTransactions(details).then(data => data)
}

function getAllUsersTransactions(details) {

    return service.getAllUsersTransactions(details).then(data => data)
}

function getBazorpayPaymentStatus(details) {

    return service.getBazorpayPaymentStatus(details).then(data => data)
}

function updateTransaction(details) {

    return service.updateTransaction(details).then(data => data)
}

function updateCallbackUrl(details) {

    return service.updateCallbackUrl(details).then(data => data)
}

function getProfileData(details) {

    return service.getProfileData(details).then(data => data)
}
function getPayinStatus(details) {

    return service.getPayinStatus(details).then(data => data)
}

function getPinwalletPayinStatus(details) {

    return service.getPinwalletPayinStatus(details).then(data => data)
}

function updateRedirectUrl(details) {

    return service.updateRedirectUrl(details).then(data => data)
}

function sendPayinRequestIntent(details) {

    return service.sendPayinRequestIntent(details).then(data => data)
}

function getVolumes(details) {

    return service.getVolumes(details).then(data => data)
}

function getDataByUtr(details) {

    return service.getDataByUtr(details).then(data => data)
}

function getTransactionsUser(details) {

    return service.getTransactionsUser(details).then(data => data)
}

function getTransactionsByDate(details) {

    return service.getTransactionsByDate(details).then(data => data)
}

function getTransactionsByStatus(details) {

    return service.getTransactionsByStatus(details).then(data => data)
}

function fetchPayinStatus(details) {

    return service.fetchPayinStatus(details).then(data => data)
}

function getEncryptionKey(details) {

    return service.getEncryptionKey(details).then(data => data)
}

function getAllUserSettlements(details) {

    return service.getAllUserSettlements(details).then(data => data)
}

function getAllTransactionWithSuccessStatus(details) {

    return service.getAllTransactionWithSuccessStatus(details).then(data => data)
}

function sendPayinRequestCollect(details) {

    return service.sendPayinRequestCollect(details).then(data => data)
}

function sendPayinRequestPage(details) {

    return service.sendPayinRequestPage(details).then(data => data)
}
module.exports = {


    register,

    verifySecurityCode,

    resendCode,

    login,
   
    CheckWallet,
   
    confirmOtp,

    getBalance,

    getAllBalances,

    Balance,

    sendPaymentRequest,

    getAllUserTransactions,

    sendPayinRequest,
    
    resetPassword,

    getAllUsersTransactions,

    getBazorpayPaymentStatus,

    updateProfile,

    updateTransaction,

    getProfileData,

    getPayinStatus,

    getPinwalletPayinStatus,

    updateCallbackUrl,

    updateRedirectUrl,

    sendPayinRequestIntent,

    getVolumes,

    getDataByUtr,

    getTransactionsUser,

    getTransactionsByDate,

    getTransactionsByStatus,

    fetchPayinStatus,

    getEncryptionKey,

    getAllUserSettlements,

    getAllTransactionWithSuccessStatus,

    sendPayinRequestCollect,

    sendPayinRequestPage
  
}
//exp://wz-erk.tushant07.munziapp.exp.direct:80
const mongoose = require('mongoose')
const constants = require('../../constants')
const appUtil = require('../../appUtils')


const Schema = new mongoose.Schema({
    emailId: { type: String, index: { unique: true } },
    first_name: { type: String },
    last_name: { type: String },
    business_name: { type: String },
    business_type: { type: String },
    apiKey: { type: String, required: true },
    phone: { type: String },
    password: { type: String },
    token: { type: String },
    payoutsActive:{ type: Boolean, default: false }, 
    balance: { type: Number, default: 0 },
    payoutBalance: { type: Number, default: 0 },
    assigned: { type: Boolean, default: false }, //
    assignedTo: { type: mongoose.Schema.Types.ObjectId, default: null },
    assignedSales: [
        {
            type: mongoose.Schema.Types.ObjectId,
            //   ref: constants.DB_MODEL_REF.USERS,
        }
    ],
    gateway: { type: String },
    callbackUrl: { type: String },
    payoutCallbackUrl: { type: String },
    redirectUrl: { type: String },
    premium: { type: String },
    premiumGateway: { type: String },
    payoutGateway: { type: String },
    last24hr: { type: String, default: '0' },
    last24hrSuccess: { type: String, default: '0' },
    last24hrTotal: { type: String, default: '0' },
    yesterday: { type: String, default: '0' },
    yesterdayTransactions: { type: String, default: '0' },
    successfulTransactions: { type: String, default: '0' },
    totalTransactions: { type: String, default: '0' },
    platformFee: { type: Number, default: 0 },
    todayFee: { type: Number, default: 0 },
    yesterdayFee: { type: Number, default: 0 },
    encryptionKey: { type: String },
    isBanned: { type: Boolean, default: false },
    settlements: [
        {
            amount: { type: Number },
            currency: { type: String },
            country: { type: String },
            transaction_date: { type: String },
            notes: { type: String },
            ref_no: { type: String },
            feeCharged: { type: Number },
            feePercentage: { type: Number },
            netFees: { type: Number },
            amountSettled: { type: Number },
            usdt: { type: Number },
            usdtRate: { type: Number }
        }
    ],
    payoutsData: {
        last24hr: { type: Number, default: 0 },
        last24hrSuccess: { type: Number, default: 0 },
        last24hrTotal: { type: Number, default: 0 },
        yesterday: { type: Number, default: 0 },
        yesterdayTransactions: { type: Number, default: 0 },
        successfulTransactions: { type: Number, default: 0 },
        totalTransactions: { type: Number, default: 0 },
    },

}, {
    versionKey: false,
    timeStamp: true,
    strict: true
})

module.exports = mongoose.model(constants.DB_MODEL_REF.USERS, Schema);

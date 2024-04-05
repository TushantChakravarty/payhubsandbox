const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define a separate schema for transactions
const transactionSchema = new Schema({
    uuid:{ type: String },
    transactionId: { type: String },
    merchant_ref_no: { type: String },
    amount: { type: Number },
    currency: { type: String },
    country: { type: String },
    status: { type: String },
    hash: { type: String },
    payout_type: { type: String },
    message: { type: String },
    transaction_date: { type: String },
    gateway: { type: String },
    utr: { type: String },
    phone: { type: String },
    username: { type: String },
    upiId: { type: String },
    customer_email: { type: String },
    business_name: { type: String },
    reason: { type: String },
    code: { type: String }
});

const payoutsTransactions= new Schema({
    uuid:{ type: String },
    transactionId: { type: String },
    merchant_ref_no: { type: String },
    amount: { type: Number },
    currency: { type: String },
    country: { type: String },
    status: { type: String },
    transaction_type: { type: String },
    transaction_date: { type: String },
    gateway: { type: String },
    utr: { type: String },
    phone: { type: String },
    customer_name: { type: String },
    upiId: { type: String },
    account_number: { type: String },
    account_name: { type: String },
    ifsc_code:{ type: String },
    bank_name:{type:String},
    customer_email: { type: String },
    business_name: { type: String },
    payoutAmount:{type:Number},
    comission:{type:Number},
    method:{ type: String }

});

// Define the main schema with a reference to the transactions collection
const mainSchema = new Schema({
    transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }]
});

// Create models for both schemas
const Transaction = mongoose.model('Transaction', transactionSchema);
const PayoutTransaction = mongoose.model('PayoutTransactions', payoutsTransactions);

const MainModel = mongoose.model('MainModel', mainSchema);

module.exports = { Transaction, MainModel, PayoutTransaction };

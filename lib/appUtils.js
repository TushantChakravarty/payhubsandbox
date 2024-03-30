'use strict';



var promise = require('bluebird');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken')
const fetch = require('cross-fetch');
const CryptoJS = require('crypto-js');
const { getTransactionsByStatusAndGateway } = require('./user/transactionsDao/TransactionDao');
const crypto = require("crypto")
const { parseString } = require('xml2js');
const Fetch = require('node-fetch');

async function getAllPendinTransactions(status, gateway) {
  //console.log('hit')
  const transactions = await getTransactionsByStatusAndGateway(status, gateway)
  //console.log(transactions)
  return transactions
}


/**
 * returns if email is valid or not
 * @returns {boolean}
 */
function isValidEmail(email) {
  var pattern = /(([a-zA-Z0-9\-?\.?]+)@(([a-zA-Z0-9\-_]+\.)+)([a-z]{2,3}))+$/;
  return new RegExp(pattern).test(email);
}



async function convertPass(password) {
  let pass = await bcrypt.hash(password, 10)
  // req.body.password = pass;
  return pass
}

function verifyPassword(user, isExist) {
  return bcrypt.compare(user.password, isExist.password);
}


function createToken(user) {

  console.log(process.env.TOKEN_KEY)
  const token = jwt.sign(
    { user_id: user._id, email: user.email },
    process.env.TOKEN_KEY,
    {
      expiresIn: "1h",
    }
  );

  return token;
}
function encryptText(input) {
  var ciphertext = CryptoJS.AES.encrypt(input, process.env.SECRETKEY).toString();
  console.log(ciphertext)
  return ciphertext

}
function decryptText(input) {
  var bytes = CryptoJS.AES.decrypt(input, process.env.SECRETKEY);
  var originalText = bytes.toString(CryptoJS.enc.Utf8);
  console.log(originalText)
  return originalText

}
function encryptParameters(input, secretKey) {
  var ciphertext = CryptoJS.AES.encrypt(input, secretKey).toString();
  console.log(ciphertext)
  return ciphertext

}

function decryptParameters(input, secretKey) {
  const decryptedBytes = CryptoJS.AES.decrypt(input, secretKey);
  const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
  return decryptedData;

}


function generatePassword(len, arr) {
  let ans = '';
  for (let i = len; i > 0; i--) {
    ans +=
      arr[(Math.floor(Math.random() * arr.length))];
  }
  console.log(ans);
  return ans
}

async function getCryptoData() {
  let response

  try {
    response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false"
      , {
        method: "GET",
        headers: {

          'Content-Type': 'application/json',
        },
      })
      .then((response) => response.json())
      .then((resp) => {

        //console.log(resp)


        return { resp }

      })
      .catch((error) => {
        console.error(error);
      })
  } catch (error) {
    console.log(error)
  }
  return response

}

async function airpaytest() {
  const merchant_id = process.env.AIRPAYMERCID;
  const merchant_txn_id = "486183006";
  const date_f = "2024-03-15";
  const username = process.env.AIRPAYUSERNAME;
  const password = process.env.AIRPAYPASSWORD;
  const secret = process.env.AIRPAYSECRET;

  // Generate key
  const key = crypto.createHash('sha256').update(`${username}~:~${password}`).digest('hex');

  const alldata = `${merchant_id}${merchant_txn_id}${date_f}`;

  // Calculate the checksum using SHA-256
  const checksumData = `${key}@${alldata}`;

  const checksum = crypto.createHash('sha256').update(checksumData).digest('hex');

  // Payment Gateway URL
  const paymentGatewayURL = "https://kraken.airpay.co.in/airpay/order/verify.php";
  const private_key = crypto.createHash('sha256').update(`${secret}@${username}:|:${password}`).digest('hex');

  // Prepare the POST data
  const postData = new URLSearchParams();
  postData.append('merchant_id', merchant_id);
  postData.append('merchant_txn_id', merchant_txn_id);
  postData.append('private_key', private_key);
  postData.append('checksum', checksum);
  
  // Perform the POST request
  try {
      const response = await fetch(paymentGatewayURL, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: postData,
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const xmlData = await response.text();

      // Convert XML to JSON
      parseString(xmlData, (err, result) => {
          if (err) {
              console.error('Error parsing XML:', err);
          } else {
              // Result is the JSON representation
              console.log('JSON Response:', result.RESPONSE.TRANSACTION);
              // res.send(result)
          }
      });
  } catch (error) {
      console.error('Error:', error);
  }
}




module.exports = {


  verifyPassword,

  isValidEmail,

  convertPass,

  createToken,

  encryptText,

  decryptText,

  getCryptoData,

  generatePassword,

  encryptParameters,

  decryptParameters,

  getAllPendinTransactions,

  airpaytest

};


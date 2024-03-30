'use strict';



var promise = require('bluebird');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken')
const fetch = require('cross-fetch');
const CryptoJS = require('crypto-js');
const { getTransactionsByStatusAndGateway } = require('./user/transactionsDao/TransactionDao');
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

  getAllPendinTransactions

};


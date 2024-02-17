const crypto = require('crypto');
const axios = require('axios');
const fetch = require("node-fetch");
const sha256 = require('sha256')
const hash = require('hash.js');
const date = require('date-and-time');
const CryptoJS = require('crypto-js');
const aesjs = require('aes-js');
const phpjs = require('phpjs');

const sendAirpayQrRequest = async (details) => {
  console.log('check', details)
  const response = await fetch("https://kraken.airpay.co.in/airpay/api/generateOrder.php", {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
      'AuthKey': 'edb7293b7a983d8b330a52a2ef139b8ee8054ac832db536491d197fee0184667',
    },
    body: JSON.stringify(
      {
        encData: details.encryptedData,
        checksum: details.checksum,
        mid: "294431"

      })
  })
    .then(resp => resp.json())
    .then(json => {
      if (json)
        return json
      return false
    })
    .catch((error) => {
      console.log(error)
    })
  return response

}
const check2 = async (referenceId,details)=>{
  const mercid = '294431';
const secretKey = "4z74sYwdqYUX6Pgv";
const username = "S8cyj8tS3m"
const password = "M3qt6RJk"
const secret = "4z74sYwdqYUX6Pgv"

const key256 = CryptoJS.SHA256(`${username}~:~${password}`).toString();
console.log('key256', key256);

const orderid = referenceId;
const amt = details.amount;
const buyerPhone = details.phone;
const buyerEmail = details.customer_email;
const mer_dom = Buffer.from('https://server.payhub.link').toString('base64');
const call_type = "upiqr";

// Concatenate the data as in PHP
const alldata = `${mercid}${orderid}${amt}${buyerPhone}${buyerEmail}${mer_dom}${call_type}`;

// Format the current date like PHP
const currentDate = date.format(new Date(), 'YYYY-MM-DD');

// Calculate the checksum using SHA-256
const checksumData = `${key256}@${alldata}${currentDate}`;
const checksum = crypto.createHash('sha256').update(checksumData).digest('hex');
console.log(checksum)

const data = {
mercid,
orderid,
amount: amt,
buyerPhone,
buyerEmail,
mer_dom,
call_type,
};

const encKey = crypto.createHash('md5').update(secret).digest('hex');
console.log(encKey)
const iv = crypto.randomBytes(8).toString('hex');
const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encKey), iv);
let encData = cipher.update(JSON.stringify(data), 'utf8', 'base64');
encData += cipher.final('base64');
console.log(iv+encData)
const postData = JSON.stringify({
'encData': iv+encData,
'checksum': checksum,
'mercid': mercid,
});
const response = await axios
.post('https://kraken.airpay.co.in/airpay/api/generateOrder.php', postData, {
headers: {
'Content-Type': 'application/json',
},
})
.then((response) => {
//console.log(response)
const redData = response.data;
const encryptedData = redData.data;
console.log(encryptedData)
const iv = Buffer.from(encryptedData.slice(0, 16), 'binary');
const encrypted = Buffer.from(encryptedData.slice(16), 'base64');

const decipher = crypto.createDecipheriv('aes-256-cbc', encKey, iv);
let decrypted = decipher.update(encrypted, 'binary', 'utf8');
decrypted += decipher.final('utf8');
//console.log(decrypted);
return decrypted
})
.catch((error) => {
console.error(error);
});
return response
}

const airpayPayin = async (referenceId,details)=>{
const mercid = process.env.AIRPAYMERCID;
const username = process.env.AIRPAYUSERNAME
const password = process.env.AIRPAYPASSWORD
const secret = process.env.AIRPAYSECRET

const key256 = CryptoJS.SHA256(`${username}~:~${password}`).toString();
//console.log('key256', key256);

const orderid = referenceId;
const amt = details.amount;
const buyerPhone = details.phone;
const buyerEmail = details.customer_email;
const mer_dom = Buffer.from('https://server.payhub.link').toString('base64');
const call_type = "upiqr";
// const Data ={
//   mercid,
//   orderid,
//   amt,
//   buyerPhone,
//   buyerEmail,
//   mer_dom,
//   call_type
// }
// Concatenate the data as in PHP
const alldata = `${mercid}${orderid}${amt}${buyerPhone}${buyerEmail}${mer_dom}${call_type}`;
//console.log(Data)
// Format the current date like PHP
const currentDate = date.format(new Date(), 'YYYY-MM-DD');

// Calculate the checksum using SHA-256
const checksumData = `${key256}@${alldata}${currentDate}`;
const checksum = crypto.createHash('sha256').update(checksumData).digest('hex');
//console.log(checksum)

const data = {
mercid,
orderid,
amount: amt,
buyerPhone,
buyerEmail,
mer_dom,
call_type,
};

const encKey = crypto.createHash('md5').update(secret).digest('hex');
//console.log(encKey)
const iv = crypto.randomBytes(8).toString('hex');
const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encKey), iv);
let encData = cipher.update(JSON.stringify(data), 'utf8', 'base64');
encData += cipher.final('base64');
//console.log(iv+encData)
const postData = JSON.stringify({
'encData': iv+encData,
'checksum': checksum,
'mercid': mercid,
});
const response = await axios
.post('https://kraken.airpay.co.in/airpay/api/generateOrder.php', postData, {
headers: {
'Content-Type': 'application/json',
},
})
.then((response) => {
//console.log(response)
const redData = response.data;
const encryptedData = redData.data;
//console.log(encryptedData)
const iv = Buffer.from(encryptedData.slice(0, 16), 'binary');
const encrypted = Buffer.from(encryptedData.slice(16), 'base64');

const decipher = crypto.createDecipheriv('aes-256-cbc', encKey, iv);
let decrypted = decipher.update(encrypted, 'binary', 'utf8');
decrypted += decipher.final('utf8');
//console.log(decrypted);
return decrypted
})
.catch((error) => {
console.error(error);
});
return response
}

const check = ()=>{
  

const mercid = '294431';
  const secretKey = "4z74sYwdqYUX6Pgv";
  const username = "DIGISLTS678760"
  const password = "TSAWRIL@8gh75kf"
  const secret = "4z74sYwdqYUX6Pgv"

  const key256 = CryptoJS.SHA256(username + "~:~" + password).toString(CryptoJS.enc.Hex);
  console.log(key256)
  const orderid = "230918184855912Bkkj";
const amt = "300.00";
const buyerPhone = "9340079982";
const buyerEmail = "tushant@gmail.com";
const mer_dom = Buffer.from('https://server.payhub.link/admin/savetxairpay').toString('base64');
const call_type = "upiqr";

// Concatenate the data as in PHP

// Concatenate the data as in PHP
const alldata = mercid + orderid + amt + buyerPhone + buyerEmail + mer_dom + call_type;

const currentDate = new Date().toISOString().split('T')[0];

const checksumData = key256 + '@' + alldata + currentDate;

const checksum = CryptoJS.SHA256(checksumData).toString(CryptoJS.enc.Hex);

console.log(checksum);
  
  const data = {
    mercid,
    orderid,
    amount: amt,
    buyerPhone,
    buyerEmail,
    mer_dom,
    call_type,
  };
  
  const json_data = JSON.stringify(data);

  const encKey = crypto.createHash('md5').update(secret).digest('hex').slice(0, 32); // Ensure the key length is 32 bytes

const iv = crypto.randomBytes(16);
const textBytes = aesjs.utils.utf8.toBytes(json_data);
const aesCtr = new aesjs.ModeOfOperation.ctr(aesjs.utils.hex.toBytes(encKey), new aesjs.Counter(5));
const encryptedBytes = aesCtr.encrypt(textBytes);
const encData = aesjs.utils.hex.fromBytes(iv) + aesjs.utils.hex.fromBytes(encryptedBytes);

  
console.log(encData);
  
  const postData = JSON.stringify({
    'encData': encData,
    'checksum': checksum,
    'mercid': mercid,
  });
    console.log(postData)
  axios
    .post('https://kraken.airpay.co.in/airpay/api/generateOrder.php', postData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => {
      //console.log(response)
      const redData = response.data;
      const encryptedData = redData.data;
      console.log(encryptedData)
      const iv = Buffer.from(encryptedData.slice(0, 16), 'binary');
      const encrypted = Buffer.from(encryptedData.slice(16), 'base64');

    const decipher = crypto.createDecipheriv('aes-256-cbc', encKey, iv);
    let decrypted = decipher.update(encrypted, 'binary', 'utf8');
    decrypted += decipher.final('utf8');
    console.log(decrypted);
    })
    .catch((error) => {
      console.error(error);
    });
  //jj
}

function encryptAirpayRequest() {



// Execute the PHP code
  const mercid = '294431';
  const secretKey = "4z74sYwdqYUX6Pgv";
  const username = 'DIGISLTS678760'
  const password = "TSAWRIL@8gh75kf"
  const secret = '4z74sYwdqYUX6Pgv'
  const keySeed = crypto.createHash('md5').update(secret).digest('hex');

// Expand the 128-bit MD5 hash to a 256-bit key using a KDF
const encKey = crypto.pbkdf2Sync(keySeed, 'salt', 100000, 32, 'sha256'); // Derive a 256-bit key

const orderid = "230918184855912BuA4lwHk";
const amt = "300.00";
const buyerPhone = "9999999999";
const buyerEmail = "test@gmail.com";
const mer_dom = Buffer.from('http://localhost').toString('base64');
const call_type = "upiqr";

const alldata = mercid + orderid + amt + buyerPhone + buyerEmail + mer_dom + call_type;

const checksum = crypto.createHash('sha256').update(keySeed + '@' + alldata + (new Date()).toISOString().slice(0, 10)).digest('hex');

const fields = {
  mercid: mercid,
  orderid: orderid,
  amount: amt,
  buyerPhone: buyerPhone,
  buyerEmail: buyerEmail,
  mer_dom: mer_dom,
  call_type: call_type,
};

const json_data = JSON.stringify(fields);

const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv('aes-256-cbc', encKey, iv);
let encData = cipher.update(json_data, 'utf8', 'base64');
encData += cipher.final('base64');

  const postData = { encData: encData, checksum, mercid: mercid, encKey };
 return postData
  // const options = {
  //   hostname: 'kraken.airpay.co.in',
  //   path: '/airpay/api/generateOrder.php',
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Content-Length': Buffer.byteLength(postData)
  //   }
  // };

  // const req = https.request(options, (res) => {
  //   let data = '';

  //   res.on('data', (chunk) => {
  //     data += chunk;
  //   });

  //   res.on('end', () => {
  //     const redData = JSON.parse(data);
  //     const encryptedData = redData.data;
  //     const iv = encryptedData.slice(0, 16);
  //     const encryptedDataStr = encryptedData.slice(16);
  //     const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encKey, 'hex'), Buffer.from(iv, 'hex'));
  //     let decryptedData = decipher.update(Buffer.from(encryptedDataStr, 'base64'), 'binary', 'utf8');
  //     decryptedData += decipher.final('utf8');
  //     console.log(decryptedData);
  //   });
  // });

  // req.on('error', (error) => {
  //   console.error(error);
  // });

  // req.write(postData);
  // req.end();

}

function decryptAirpayResponse(data, encKey) {
  try {
    console.log(data,encKey)
    const encryptedData = data;
    console.log(encryptedData)
    const iv = encryptedData.slice(0, 16);
    const encryptedDataStr = encryptedData.slice(16);
    console.log(encryptedDataStr)
    const decipher = crypto.createDecipheriv('aes-256-cbc', encKey, iv);
    decipher.setAutoPadding(true); // Set to use PKCS7 padding

    let decryptedData = decipher.update(Buffer.from(encryptedDataStr, 'base64'), null, 'utf8');
    console.log(decryptedData)
    decryptedData += decipher.final('utf8');
    
    console.log('My Decrypt Data', decryptedData);
  } catch (error) {
    console.error('Exception in decrypt:', error);
  }
}

async function createPaymentRequestAirpay(){
 const paymentdata= {
    "batch_code": "2022JAN",
    "batch_name": "Affiliate Payout Batch of January 2022",
    "transfers": [
        {
            "transfer_number": "10",
            "UID": "USER1",
            "payee_name": "John Brown",
            "payee_mobile": "9846030201",
            "bank_name": "SBI",
            "bank_account_type": "savings",
            "bank_account_number": "560002379833",
            "bank_ifsc": "SBIN0016387",
            "currency": "INR",
            "amount": 2500,
            "transfer_mode": "NEFT"
        },
        {
            "transfer_number": "11",
            "payee_name": "Shivam Sharma",
            "payee_mobile": "9846030201",
            "partner_bank_id": "100",
            "currency": "INR",
            "amount": 1850,
            "transfer_mode": "IMPS"
        }
    ]
}
const mercid = '294431';
const secretKey = "4z74sYwdqYUX6Pgv";
const username = "S8cyj8tS3m"
const password = "M3qt6RJk"
const secret = "4z74sYwdqYUX6Pgv"
const currentDate = date.format(new Date(), 'YYYY-MM-DD');

// Calculate the checksum using SHA-256
const checksumData = `${key256}@${alldata}${currentDate}`;
const checksum = crypto.createHash('sha256').update(checksumData).digest('hex');
console.log(checksum)

const data = {
mercid,
orderid,
amount: amt,
buyerPhone,
buyerEmail,
mer_dom,
call_type,
};

const encKey = crypto.createHash('md5').update(secret).digest('hex');
console.log(encKey)
const iv = crypto.randomBytes(8).toString('hex');
const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encKey), iv);
let encData = cipher.update(JSON.stringify(data), 'utf8', 'base64');
encData += cipher.final('base64');
console.log(iv+encData)
const postData = JSON.stringify({
'encData': iv+encData,
'checksum': checksum,
'mercid': mercid,
});
}

module.exports = {
  sendAirpayQrRequest,
  encryptAirpayRequest,
  decryptAirpayResponse,
  check,
  check2,
  airpayPayin
}
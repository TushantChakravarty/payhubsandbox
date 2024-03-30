// load all dependencies
var Promise = require('bluebird');
var jwt = Promise.promisifyAll(require('jsonwebtoken'));
var appConstants = require('./constants');
const { responseMapping } = require('./user/userMapper');
const { MESSAGE } = require('./user/userConstants');
//var TOKEN_EXPIRATION_SEC = appConstants.TOKEN_EXPIRATION_TIME * 60;



const TOKEN_EXPIRATION_SEC = 365 * 24 * 60 * 60; // 1 year in seconds

const genUsrToken = async function (user) {
  var options = { expiresIn: TOKEN_EXPIRATION_SEC };
  try {
    const jwtToken = await jwt.signAsync(user, process.env.JWTSECRET, options);
    return jwtToken;
  } catch (err) {
    console.error(err);
    throw err; // Re-throw the error to handle it at a higher level if needed
  }
};

async function generatePageExpiryToken(emailId,apiKey)
{
  const secretKey = process.env.PAGEEXPIRY;

// User information or any data you want to include in the token payload
const payload = {
   emailId,
   apiKey,
};

// Set the expiration time to 1 minute (60 seconds)
const expiresIn = '15m';

// Create the token
const token = jwt.sign(payload, secretKey, { expiresIn });

//console.log('Generated Token:', token);
return token
}

function verifyPageToken(token) {
  if(!token || token==undefined)
  {
    console.log('no token or corrupt token')
    return responseMapping(appConstants.CODE.FRBDN,MESSAGE.InvalidCredentials)
  }

  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.PAGEEXPIRY, (err, decoded) => {
      if (err) {
        // Token verification failed
        console.log('invalid')
        reject(err);
        return responseMapping(appConstants.CODE.FRBDN,MESSAGE.InvalidCredentials)
      } else {
        // Token is valid
        console.log('valid page token')
        resolve(decoded);
        return responseMapping(appConstants.CODE.Success,MESSAGE.Success)
      }
    });
  });
}




module.exports = {
  genUsrToken,

  generatePageExpiryToken,

  verifyPageToken
};

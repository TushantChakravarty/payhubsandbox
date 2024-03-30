const router = require("express").Router();
const facade = require('./userFacade');
const validators = require('./userValidators');
const usrConst = require('./userConstants');
const mapper = require('./userMapper');
const crypto = require("crypto")
const CryptoJS = require('crypto-js')
const date = require('date-and-time');
const { parseString } = require('xml2js');
const { genUsrToken } = require('../jwtHandler');
const auth = require('../middleware/auth')
const IP = require('ip');




router.route('/register').post((req, res) => {

    let details = req.body
    console.log(req.body)
    facade.register(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/confirmotp').post((req, res) => {

    let details = req.body
    console.log(req.body)
    facade.confirmOtp(details).then((result) => {
        console.log(result)

        res.send(result)

    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})




router.route('/login').post((req, res) => {

    let details = req.body
    const ipAddress = IP.address();
    console.log('ip', ipAddress)
    facade.login(details).then((result) => {
        console.log(result)
        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})




router.route('/forgotPassword').post([validators.checkToken], (req, res) => {

    let apiKey = req.headers['apikey']

    let details = req.body
    details.apiKey = apiKey
    facade.resetPassword(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/setNewPassword/:redisId').post([validators.checkSetNewPasswordRequest], (req, res) => {

    let { redisId } = req.params
    let { password } = req.body
    console.log(redisId)

    facade.setNewPassword(redisId, password).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/sendPaymentRequest').post([validators.checkToken], (req, res) => {


    let apiKey = req.headers['apikey']

    let details = req.body
    details.apiKey = apiKey
    facade.sendPaymentRequest(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/sendPayinRequest').post([validators.checkToken], (req, res) => {
    //let apiKey = req.headers['apikey']

    //let details = req.body
    // details.apiKey = apiKey
    facade.sendPayinRequest(req.body).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/sendPayinPageRequest').post([validators.checkToken], (req, res) => {
    let apiKey = req.headers['apikey']

    let details = req.body
    details.apiKey = apiKey
    facade.sendPayinRequestPage(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/getvolumes').post([validators.checkToken], (req, res) => {
    let apiKey = req.headers['apikey']

    let details = req.body
    details.apiKey = apiKey
    facade.getVolumes(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})


router.route('/sendPayinRequestIntent').post([validators.checkToken], (req, res) => {
    let apiKey = req.headers['apikey']

    let details = req.body
    details.apiKey = apiKey
    facade.sendPayinRequestIntent(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})


router.route('/getAllUserTransactions').post([validators.checkToken], (req, res) => {


    let apiKey = req.headers['apikey']

    let details = req.body
    details.apiKey = apiKey
    facade.getAllUserTransactions(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/getAllTransactions').post((req, res) => {

    let apiKey = req.headers['apikey']

    let details = req.body
    details.apiKey = apiKey

    facade.getAllUsersTransactions(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/getTransactionStatus').post([validators.checkToken], (req, res) => {



    facade.getBazorpayPaymentStatus(req.body).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/getProfile').post([validators.checkToken], (req, res) => {



    facade.getProfileData(req.body).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/updateProfile').post([validators.checkToken], (req, res) => {


    let apiKey = req.headers['apikey']

    let details = req.body
    details.apiKey = apiKey
    facade.updateProfile(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/updateCallbackUrl').post([validators.checkToken], (req, res) => {

    let apiKey = req.headers['apikey']

    let details = req.body
    details.apiKey = apiKey

    facade.updateCallbackUrl(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/updateRedirectUrl').post([validators.checkToken], (req, res) => {

    let apiKey = req.headers['apikey']

    let details = req.body
    details.apiKey = apiKey

    facade.updateRedirectUrl(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/updateTransaction').post([validators.checkToken], (req, res) => {


    let apiKey = req.headers['apikey']

    let details = req.body
    details.apiKey = apiKey
    facade.updateTransaction(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/getpayinstatus').post([validators.checkToken], (req, res) => {


    let apiKey = req.headers['apikey']

    let details = req.body
    details.apiKey = apiKey
    facade.fetchPayinStatus(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})


router.route('/getpinwalletpayinstatus').post([validators.checkToken], (req, res) => {

    console.log(req.body)

    facade.getPinwalletPayinStatus(req.body).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/getdatabyutr').post([validators.checkToken], (req, res) => {

    console.log(req.body)
    let apiKey = req.headers['apikey']

    let details = req.body
    details.apiKey = apiKey
    facade.getDataByUtr(req.body).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/getTransactionsUser').post([validators.checkToken], (req, res) => {

    console.log(req.body)
    let apiKey = req.headers['apikey']

    let details = req.body
    details.apiKey = apiKey
    facade.getTransactionsUser(req.body).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/getTransactionsByDate').post([validators.checkToken], (req, res) => {

    console.log(req.body)
    let apiKey = req.headers['apikey']

    let details = req.body
    details.apiKey = apiKey
    facade.getTransactionsByDate(req.body).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/getTransactionsByStatus').post([validators.checkToken], (req, res) => {

    console.log(req.body)
    let apiKey = req.headers['apikey']

    let details = req.body
    details.apiKey = apiKey
    facade.getTransactionsByStatus(req.body).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/getTransactionsByStatusAndDate').post([validators.checkToken], (req, res) => {

    console.log(req.body)
    let apiKey = req.headers['apikey']

    let details = req.body
    details.apiKey = apiKey
    facade.getTransactionsByStatusAndDate(req.body).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/getencryptionkey').post([validators.checkToken], (req, res) => {

    console.log(req.body)
    let apiKey = req.headers['apikey']

    let details = req.body
    details.apiKey = apiKey
    facade.getEncryptionKey(req.body).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/getallusersettlements').post([validators.checkToken], (req, res) => {

    console.log(req.body)
    let apiKey = req.headers['apikey']

    let details = req.body
    details.apiKey = apiKey
    facade.getAllUserSettlements(req.body).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/getmerchantlogs').post([validators.checkToken], (req, res) => {

    console.log(req.body)
    let apiKey = req.headers['apikey']

    let details = req.body
    details.apiKey = apiKey
    facade.getAllTransactionWithSuccessStatus(req.body).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/sendpayinrequestcollect').post([validators.checkToken], (req, res) => {

    console.log(req.body)
    let apiKey = req.headers['apikey']

    let details = req.body
    details.apiKey = apiKey
    facade.sendPayinRequestCollect(req.body).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/updatePayoutCallbackUrl').post([validators.checkToken], (req, res) => {

    console.log(req.body)
    let apiKey = req.headers['apikey']

    let details = req.body
    details.apiKey = apiKey
    facade.updatePayoutCallbackUrl(req.body).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})
router.route('/airpayfetchtest').get((req, res) => {
    const merchant_id = process.env.AIRPAYMERCID;
    const merchant_txn_id = "250806099"
    const date_f = "2023-11-01"
    const username = process.env.AIRPAYUSERNAME
    const password = process.env.AIRPAYPASSWORD
    const secret = process.env.AIRPAYSECRET

    // Generate key
    const key = CryptoJS.SHA256(`${username}~:~${password}`).toString();

    const private_key = crypto.createHash('sha256').update(`${secret}.@.${username}.:|:.${password}`).digest('hex');

    const alldata = `${merchant_id}${merchant_txn_id}${date_f}`;

    // Calculate the checksum using SHA-256
    const checksumData = `${key}@${alldata}`;
    console.log(checksumData);
    const checksum = crypto.createHash('sha256').update(checksumData).digest('hex');

    // Payment Gateway URL
    const paymentGatewayURL = "https://kraken.airpay.co.in/airpay/order/verify.php";

    // Prepare the POST data
    const postData = new URLSearchParams();
    postData.append('merchant_id', merchant_id);
    postData.append('merchant_txn_id', merchant_txn_id);
    postData.append('private_key', private_key);
    postData.append('checksum', checksum);
    console.log("this is postdata", postData)



    // Perform the POST request
    // fetch(paymentGatewayURL, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/x-www-form-urlencoded',
    //     },
    //     body: postData,
    // })
    //     .then(response => {
    //         console.log("this is response", response.body)
    //         response.json()
    //     })
    //     .then(data => {
    //         console.log('Response:', data);
    //     })
    //     .catch(error => {
    //         console.error('Error:', error);
    //     });

    fetch(paymentGatewayURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: postData,
    })
        .then(response => response.text())
        .then(xmlData => {
            // Convert XML to JSON
            parseString(xmlData, (err, result) => {
                if (err) {
                    console.error('Error parsing XML:', err);
                } else {
                    // Result is the JSON representation
                    console.log('JSON Response:', result.transaction);
                    res.send(result)
                }
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });



})



module.exports = router

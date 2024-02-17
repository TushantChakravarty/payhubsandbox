const router = require("express").Router();
const facade = require('./userFacade');
const validators = require('./userValidators');
const usrConst = require('./userConstants');
const mapper = require('./userMapper');
const { genUsrToken } = require('../jwtHandler');
const auth  = require('../middleware/auth')
const IP = require('ip');




router.route('/register').post( (req, res) => {

    let details = req.body
    console.log(req.body)
    facade.register(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/confirmotp').post( (req, res) => {

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
    console.log('ip',ipAddress)
    facade.login(details).then((result) => {
        console.log(result)
        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})




router.route('/forgotPassword').post([validators.checkToken],(req, res) => {

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

router.route('/getAllTransactions').post( (req, res) => {

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

router.route('/updateProfile').post( [validators.checkToken],(req, res) => {

   
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

router.route('/updateCallbackUrl').post( [validators.checkToken],(req, res) => {

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

router.route('/updateRedirectUrl').post( [validators.checkToken],(req, res) => {

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
 


module.exports = router

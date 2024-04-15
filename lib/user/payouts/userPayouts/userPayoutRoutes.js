const router = require("express").Router();
const service = require('./userPayoutServices');
const usrConst = require('../../userConstants');
const mapper = require('../../userMapper');


router.route('/getPayoutsData').post( (req, res) => {

  
    let apiKey = req.headers['apikey']
   
    let details = req.body
    details.apiKey = apiKey
    service.getMerchantPayoutData(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/getAllMerchantPayouts').post( (req, res) => {

  
    let apiKey = req.headers['apikey']
   
    let details = req.body
    details.apiKey = apiKey
    service.getAllMerchantPayouts(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/getPayoutByUtr').post( (req, res) => {

  
    let apiKey = req.headers['apikey']
   
    let details = req.body
    details.apiKey = apiKey
    service.getMerchantPayoutByUtr(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/getAllPayoutsData').post( (req, res) => {

  
    let apiKey = req.headers['apikey']
   
    let details = req.body
    details.apiKey = apiKey
    service.getAllPayoutsDataMerchant(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/getPayoutLogs').post( (req, res) => {

  
    let apiKey = req.headers['apikey']
   
    let details = req.body
    details.apiKey = apiKey
    service.getMerchantPayoutLogs(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/updatePayoutBalance').post( (req, res) => {

  
    let apiKey = req.headers['apikey']
   
    let details = req.body
    details.apiKey = apiKey
    service.updatePayoutBalance(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})
module.exports = router

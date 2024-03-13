const router = require("express").Router();
const service = require('./callbackServices');
const usrConst = require('../userConstants');
const mapper = require('../userMapper');



router.route('/pinwalletPayoutStatus').post( (req, res) => {

    let details = req.body
    console.log(req.body)
    service.pinwalletPayoutCallback(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/paytmePayoutStatus').post( (req, res) => {

    let details = req.body
   // console.log(req.body)
    service.paytmePayoutCallback(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/paytmePayinCallback').post( (req, res) => {

    let details = req.body
    console.log(req.body)
    service.saveTxPaytme(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/autoCallback').post( (req, res) => {

    let apiKey = req.headers['apikey']

    let details = req.body
    details.apiKey = apiKey
    service.autoCallback(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/autoCallbackPayout').post( (req, res) => {

    let apiKey = req.headers['apikey']

    let details = req.body
    details.apiKey = apiKey
    service.autoCallbackPayout(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})


module.exports = router

const router = require("express").Router();
const facade = require('./reportsFacade');
const validators = require('./userValidators');
const usrConst = require('./userConstants');
const mapper = require('./userMapper');



router.route('/getTotalVolume').post((req, res) => {

    let details = req.body
    console.log(req.body)
    facade.getTotalVolume(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

router.route('/getTotalPayoutVolume').post((req, res) => {

    let details = req.body
    console.log(req.body)
    facade.getTotalPayoutVolume(details).then((result) => {

        res.send(result)
    }).catch((err) => {

        console.log({ err })
        res.send(mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError))
    })
})

module.exports = router

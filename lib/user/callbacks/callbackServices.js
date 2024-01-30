const transactionsDao = require('./callbacksDao')
const usrConst = require('../userConstants')
const mapper = require('../userMapper')


async function pinwalletPayoutCallback(details) {
    console.log("pinwallet payout",details)
    if(details)
    {
        return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, "success")

    }else{
        return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)

    }
}

module.exports ={
    pinwalletPayoutCallback
}
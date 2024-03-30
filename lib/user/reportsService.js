const transactionsDao = require('./transactionDao')
const usrConst = require('./userConstants')
const mapper = require('./userMapper')
const dao = require("./adminDao")




async function validateRequest(details) {
    let query = {
        emailId: details.emailId
    }
    return dao.getUserDetails(query).then(async (userExists) => {
        if (userExists) {
            if (details.apiKey == userExists.apiKey) {
                return true
            }
            else {
                return false
            }
        } else {
            return mapper.responseMapping(usrConst.CODE.BadRequest, 'User does not exist')

        }
    })
}


async function getTotalVolume(details) {
    return validateRequest(details)
        .then((response) => {
            if (response == true) {
                if(details.email_Id=='all'&&details.startDate=="all"&&details.endDate=='all'&&details.gateway=="all"&&details.status)
                {

                    return transactionsDao.getTotalVolume(details.status).then((volume) => {
                        if (volume) {
                            //console.log('success', user)
                            
                            return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, volume)
                            
                            
                        } else {
                            
                            console.log("Failed to get data")
                            return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success,0)
                        }
                    })
                }
                else if(details.email_Id=='all'&&details.startDate&&details.endDate&&details.gateway=="all"&&details.gateway!==""&&details.status&&details.startTime=='all'&&details.endTime=='all')
                {

                    return transactionsDao.getTotalVolumeByDate(details.status,details.startDate,details.endDate).then((volume) => {
                        if (volume) {
                            //console.log('success', user)
                            
                            return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, volume)
                            
                            
                        } else {
                            
                            console.log("Failed to get data")
                            return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
                        }
                    })
                }
                else if(details.email_Id=='all'&&details.startDate&&details.endDate&&details.gateway=="all"&&details.gateway!==""&&details.status&&details.startTime&&details.endTime)
                {

                    return transactionsDao.getTotalVolumeByDateWithTime(details.status,details.startDate,details.endDate,details.startTime,details.endTime).then((volume) => {
                        if (volume) {
                            //console.log('success', user)
                            
                            return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, volume)
                            
                            
                        } else {
                            
                            console.log("Failed to get data")
                            return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
                        }
                    })
                }
                else if(details.email_Id=='all'&&details.startDate=="all"&&details.endDate=='all'&&details.gateway&&details.gateway!==""&&details.status&&details.startTime=='all'&&details.endTime=='all')
                {

                    return transactionsDao.getTotalVolumeByGatewayAndStatus(details.status,details.gateway).then((volume) => {
                        if (volume) {
                            //console.log('success', user)
                            
                            return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, volume)
                            
                            
                        } else {
                            
                            console.log("Failed to get data")
                            return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
                        }
                    })
                }
                else if(details.email_Id=='all'&&details.startDate&&details.endDate&&details.gateway&&details.gateway!==""&&details.status&&details.startTime=='all'&&details.endTime=='all')
                {

                    return transactionsDao.getTotalVolumeByGatewayAndDate(details.status,details.gateway,details.startDate,details.endDate).then((volume) => {
                        if (volume) {
                            //console.log('success', user)
                            
                            return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, volume)
                            
                            
                        } else {
                            
                            console.log("Failed to get data")
                            return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
                        }
                    })
                }
                else if(details.email_Id=='all'&&details.startDate&&details.endDate&&details.gateway&&details.gateway!==""&&details.status&&details.startTime&&details.endTime)
                {

                    return transactionsDao.getTotalVolumeByGatewayAndDateWithTime(details.status,details.gateway,details.startDate,details.endDate,details.startTime,details.endTime).then((volume) => {
                        if (volume) {
                            //console.log('success', user)
                            
                            return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, volume)
                            
                            
                        } else {
                            
                            console.log("Failed to get data")
                            return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
                        }
                    })
                }
                else if(details.email_Id&&details.startDate=='all'&&details.endDate=="all"&&details.gateway=="all"&&details.gateway!==""&&details.status&&details.startTime=="all"&&details.endTime=="all")
                {
                    //here
                    return transactionsDao.getTotalVolumeMerchant(details.email_Id,details.status).then((volume) => {
                        if (volume) {
                            //console.log('success', user)
                            
                            return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, volume)
                            
                            
                        } else {
                            
                            console.log("Failed to get data")
                            return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
                        }
                    })
                }
                else if(details.email_Id&&details.startDate&&details.endDate&&details.gateway=="all"&&details.gateway!==""&&details.status&&details.startTime=="all"&&details.endTime=="all")
                {

                    return transactionsDao.getTotalMerchantVolumeByDate(details.email_Id,details.status,details.startDate,details.endDate).then((volume) => {
                        if (volume) {
                            //console.log('success', user)
                            
                            return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, volume)
                            
                            
                        } else {
                            
                            console.log("Failed to get data")
                            return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
                        }
                    })
                }
                else if(details.email_Id&&details.startDate=='all'&&details.endDate=="all"&&details.gateway&&details.gateway!==""&&details.status&&details.startTime=="all"&&details.endTime=="all")
                {

                    return transactionsDao.getTotalVolumeMerchantWithGateway(details.email_Id,details.status,details.gateway).then((volume) => {
                        if (volume) {
                            //console.log('success', user)
                            
                            return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, volume)
                            
                            
                        } else {
                            
                            console.log("Failed to get data")
                            return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
                        }
                    })
                }
                else if(details.email_Id&&details.startDate&&details.endDate&&details.gateway&&details.gateway!==""&&details.status&&details.startTime=="all"&&details.endTime=="all")
                {

                    return transactionsDao.getTotalMerchantVolumeByGatewayAndDate(details.email_Id,details.status,details.gateway,details.startDate,details.endDate).then((volume) => {
                        if (volume) {
                            //console.log('success', user)
                            
                            return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, volume)
                            
                            
                        } else {
                            
                            console.log("Failed to get data")
                            return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
                        }
                    })
                }
                else if(details.email_Id&&details.startDate&&details.endDate&&details.gateway=="all"&&details.gateway!==""&&details.status&&details.startTime&&details.endTime)
                {

                    return transactionsDao.getTotalMerchantVolumeByDateWithTime(details.email_Id,details.status,details.startDate,details.endDate,details.startTime,details.endTime).then((volume) => {
                        if (volume) {
                            //console.log('success', user)
                            
                            return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, volume)
                            
                            
                        } else {
                            
                            console.log("Failed to get data")
                            return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
                        }
                    })
                }
                else if(details.email_Id&&details.startDate&&details.endDate&&details.gateway&&details.gateway!==""&&details.status&&details.startTime&&details.endTime)
                {

                    return transactionsDao.getTotalMerchantVolumeByGatewayAndDateWithTime(details.email_Id,details.status,details.gateway,details.startDate,details.endDate,details.startTime,details.endTime).then((volume) => {
                        if (volume) {
                            //console.log('success', user)
                            
                            return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, volume)
                            
                            
                        } else {
                            
                            console.log("Failed to get data")
                            return mapper.responseMapping(usrConst.CODE.INTRNLSRVR, usrConst.MESSAGE.internalServerError)
                        }
                    })
                }
               
               
                else{
                    return mapper.responseMappingWithData(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails,0)

                }
            }


            else if (response == false) {
                return mapper.responseMapping(usrConst.CODE.FRBDN, 'Invalid apiKey')
            } else {
                return mapper.responseMapping(usrConst.CODE.BadRequest, response)
            }
        })
}

module.exports ={
    getTotalVolume
}
const dao = require('./payoutsDao')
const usrConst = require('../userConstants')
const mapper = require('../userMapper');
const { decryptText } = require('../../appUtils');
const service = require('../userService');

const { pinwalletPayout } = require('../../controllers/pinwallet');
async function validateRequest(details) {
    let query = {
      emailId: details.emailId,
    };
    return dao.getAdminDetails(query).then(async (userExists) => {
      //console.log(userExists)
      if (userExists) {
        if (details.apiKey == userExists.apiKey) {
          return true;
        } else {
          return false;
        }
      } else {
        return mapper.responseMapping(
          usrConst.CODE.BadRequest,
          "User does not exist"
        );
      }
    });
  }

  

async function getPayoutBalance(details) {
   // console.log(details)
   if(details)
   {
  return validateRequest(details)
  .then((response)=>{
    if(response==true)
    {
        let query ={
            emailId:details.emailId
        }
        return dao.getAdminDetails(query)
        .then((userDetails)=>{

            if(userDetails)
            {
                console.log(userDetails)
                return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, {
                    balance:userDetails.payoutsBalance
                })
                
            }else{
                return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)
                
            }
        })
    }  else if (response == false) {
        return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
      } else {
        return response;
      }
    
  })
} else {
    return mapper.responseMapping(usrConst.CODE.BadRequest, "invalid details");
  }
    
}

async function getPayoutData(details) {
    // console.log(details)
    if(details)
    {
   return validateRequest(details)
   .then((response)=>{
     if(response==true)
     {
         let query ={
             emailId:details.emailId
         }
         return dao.getAdminDetails(query)
         .then((userDetails)=>{
 
             if(userDetails)
             {
                 console.log(userDetails)
                 let response ={
                    last24hr:userDetails.payouts.last24hr,
                    yesterday:userDetails.payouts.yesterday,
                    successRate:0,
                    last24hrSuccess:userDetails.payouts.last24hrSuccess,

                 }
                 return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, response)
                 
             }else{
                 return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)
                 
             }
         })
     }  else if (response == false) {
         return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
       } else {
         return response;
       }
     
   })
 } else {
     return mapper.responseMapping(usrConst.CODE.BadRequest, "invalid details");
   }
     
 }

 async function sendPaymentRequest(details) {
    return await service.validateRequest(details).then(async (response) => {
      console.log(response);
      // return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, response)
  
      if (response == true) {
        let query = {
          emailId: details.emailId,
        };
        //console.log(details);
        return dao.getUserDetails(query).then(async (userData) => {
          const balance = userData.payoutBalance;
          console.log("balance", balance);
          if (Number(balance) > Number(details.amount)) {
            // let updatedBalance = balance - Number(details.amount)
            // updateObj.balance = updatedBalance
            // dao.updateProfile(query,updateObj)
            let gateway = userData.payoutGateway;
          
            if (gateway == "bazorpay") {
              return await bazorPay(bankDetails).then((response) => {
                if (response) {
                  if (response.message == "payout requested") {
                    const query = {
                      emailId: details.emailId,
                    };
                    const timeElapsed = Date.now();
                    const today = new Date(timeElapsed);
                    let updateObj = {
                      balance: 0,
                    };
  
                    const updateDetails = {
                      transactionId: response.data.transaction_id,
                      merchant_ref_no: "123456",
                      amount: details.amount,
                      currency: "inr",
                      country: "in",
                      status: "IN-PROCESS",
                      hash: "XYZZZZ",
                      payout_type: "net banking",
                      message: "IN-PROCESS",
                      transaction_date: today.toISOString(),
                      gateway: gateway,
                    };
                    // dao.getUserDetails(query).then((userData) => {
                    //     const balance = userData.balance
                    //     console.log('balance', balance)
                    //     if (balance && balance > details.amount) {
                    //         let updatedBalance = balance - Number(details.amount)
                    //         updateObj.balance = updatedBalance
                    //         dao.updateProfile(query, updateObj)
                    //     }
                    //     // else{
                    //     //     // let updatedBalance = Number(details.amount)
                    //     //     // updateObj.balance = updatedBalance
                    //     //     // dao.updateProfile(query,updateObj)
                    //     //     return mapper.responseMappingWithData(usrConst.CODE.BadRequest, usrConst.MESSAGE.TransactionFailure, 'Low Balance')
  
                    //     // }
                    // })
                    //dao.updateTransaction(query, updateDetails);
                    return mapper.responseMappingWithData(
                      usrConst.CODE.Success,
                      usrConst.MESSAGE.Success,
                      "Payment request submitted"
                    );
                  } else {
                    return mapper.responseMappingWithData(
                      usrConst.CODE.BadRequest,
                      usrConst.MESSAGE.InvalidDetails,
                      response
                    );
                  }
                } else {
                  return mapper.responseMapping(
                    usrConst.CODE.INTRNLSRVR,
                    usrConst.MESSAGE.internalServerError
                  );
                }
              });
            } else if (gateway == "swipeline") {
              const details = {
                beneficiaryDetails: {
                  emailAddress: "abc@gmail.com",
                  mobileNumber: "9340079982",
                  ifscCode: "SBIN0007258",
                  payeeName: "Tushant",
                },
                referenceId: "9899798",
                purposeMessage: "Test",
                toAccount: "20323508372",
                toUpi: "",
                transferType: "IMPS",
                transferAmount: "5",
                apikey: "swipe_prod_AFTRE77ap52IRtaQnWijXFqrS2OYU",
                secrete: "secret_swipe_prodytreyjkwaaBAVeeNDsJKL2",
              };
              const response = await sendPayoutRequestSwipelineIMPS(details);
              // {
              //     "status": "success",
              //     "txnId": "9F2B0C4FA73E4E5D99E3DF6FAC310933",
              //     "transferType": "IMPS",
              //     "bankReferenceNumber": "331422861398",
              //     "beneficiaryName": "Mr. TUSHANT  CHAKRABORTY",
              //     "responseCode": "S00000",
              //     "newBalance": 513447
              // }
              // console.log(response)
              return response;
            }
            else if (gateway == "pinwallet") {
             
              const response = await pinwalletPayout(details);
              const txId = Math.floor(Math.random() * 90000) + 10000;
              const timeElapsed = Date.now();
              const today = new Date(timeElapsed);
              const updateDetails ={
                uuid:userData._id,
                transactionId: txId,
                merchant_ref_no: "12345xyz",
                amount: "1000",
                currency: "inr",
                country: "india",
                status: "pending",
                transaction_type: "payout",
                transaction_date: today.toISOString(),
                gateway: gateway,
                utr: "12345xyz",
                phone: "1989898989",
                customer_name: "rahul",
                upiId: "",
                account_number: "12345xyz",
                account_name: "tushant",
                ifsc_code:"sbin0007258",
                bank_name:"sbi",
                customer_email: "xyz@email",
                business_name: userData.business_name
              }
             await dao.createTransaction(updateDetails)
              if(response.success)
              {
  
                return mapper.responseMappingWithData(
                  usrConst.CODE.Success,
                  usrConst.MESSAGE.Success,
                  "Payment request submitted"
                  );
                }else{
                  return mapper.responseMappingWithData(
                    usrConst.CODE.INTRNLSRVR,
                    usrConst.MESSAGE.TransactionFailure,
                    "Unable to process transaction at the moment"
                  );
                }
            }else{
              return mapper.responseMappingWithData(
                usrConst.CODE.BadRequest,
                usrConst.MESSAGE.TransactionFailure,
                usrConst.MESSAGE.internalServerError
              );
            }
          } else {
            // let updatedBalance = Number(details.amount)
            // updateObj.balance = updatedBalance
            // dao.updateProfile(query,updateObj)
            return mapper.responseMappingWithData(
              usrConst.CODE.BadRequest,
              usrConst.MESSAGE.TransactionFailure,
              "Low Balance"
            );
          }
        });
      } else if (response == false) {
        return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
      } else {
        return response;
      }
    });
    //    const response = await processTransactionTest2(details)
    //    return response
  }

  async function getAllPayoutTransactions(details) {
    //console.log(details)
    if(details&&details.limit&&details.skip>=0 )
    {
   return validateRequest(details)
   .then((response)=>{
     if(response==true)
     {
         let query ={
            limit:Number(details.limit),
            skip:Number(details.skip)
         }
         return dao.getAllTransactionsPayout(query)
         .then((userDetails)=>{
 
             if(userDetails)
             {
                 console.log(userDetails)
                
                 return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, userDetails?userDetails:[])
                 
             }else{
                 return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)
                 
             }
         })
     }  else if (response == false) {
         return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
       } else {
         return response;
       }
     
   })
 } else {
     return mapper.responseMapping(usrConst.CODE.BadRequest, "invalid details");
   }
     
 }

 async function getAllPayoutTransactionsMerchant(details) {
  //console.log(details)
  if(details&&details.limit&&details.skip>=0 &&details?.email_Id)
  {
 return validateRequest(details)
 .then((response)=>{
   if(response==true)
   {
       let query ={
          limit:Number(details.limit),
          skip:Number(details.skip),
          emailId:details?.email_Id
       }
       return dao.getAllMerchantPayouts(query)
       .then((userDetails)=>{
         
         if(userDetails)
         {
           // console.log(userDetails)
           
           return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, userDetails)
           
          }else{
            return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)
            
          }
        })
   }  else if (response == false) {
       return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
     } else {
       return response;
     }
   
 })
} else {
   return mapper.responseMapping(usrConst.CODE.BadRequest, "invalid details");
 }
   
}
 async function getPayoutDataMerchant(details) {
  // console.log(details)
  if(details && details?.email_Id)
  {
 return validateRequest(details)
 .then((response)=>{
   if(response==true)
   {
       let query ={
           emailId:details.email_Id
       }
       return dao.getUserDetails(query)
       .then((userDetails)=>{

           if(userDetails)
           {
              // console.log(userDetails)
               let response ={
                  last24hr:userDetails.payoutsData.last24hr,
                  yesterday:userDetails.payoutsData.yesterday,
                  successRate:0,
                  last24hrSuccess:userDetails.payoutsData.last24hrSuccess,
                  balance:userDetails.payoutBalance

               }
               return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, response)
               
           }else{
               return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)
               
           }
       })
   }  else if (response == false) {
       return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
     } else {
       return response;
     }
   
 })
} else {
   return mapper.responseMapping(usrConst.CODE.BadRequest, "invalid details");
 }
   
}

async function getPayoutDataById(details) {
  // console.log(details)
  if(details&&details?.transactionId)
  {
 return validateRequest(details)
 .then((response)=>{
   if(response==true)
   {
       
       return dao.getPayoutDataById(details?.transactionId)
       .then((userDetails)=>{

           if(userDetails)
           {
              // console.log(userDetails)
               
               return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, userDetails)
               
           }else{
               return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)
               
           }
       })
   }  else if (response == false) {
       return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
     } else {
       return response;
     }
   
 })
} else {
   return mapper.responseMapping(usrConst.CODE.BadRequest, "invalid details");
 }
   
}

async function getAllPayoutsData(details) {
  // console.log(details)
  if(details &&details?.start_date&& details?.end_date&& details?.status)
  {
 return validateRequest(details)
 .then((response)=>{
   if(response==true)
   {
       if(details?.status=="all"&&details?.start_date&&details?.end_date)
       {

         return dao.getPayoutsByDate(details?.start_date, details?.end_date)
         .then((userDetails)=>{
           
           if(userDetails)
           {
             // console.log(userDetails)
             
             return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, userDetails)
             
            }else{
              return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)
              
            }
          })
        }
        else if(details?.status=="success"||details?.status=="failed"||details?.status=="pending"&&details?.start_date=="all"&&details?.end_date=="all"&&details?.limit>0&& details?.skip>=0)
       {

         return dao.getPayoutsByStatus(details?.status, details?.limit,details?.skip)
         .then((userDetails)=>{
           
           if(userDetails)
           {
             // console.log(userDetails)
             
             return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, userDetails)
             
            }else{
              return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)
              
            }
          })
        }
        else if(details?.status=="success"||details?.status=="failed"||details?.status=="pending"&&details?.start_date&&details?.end_date)
        {
          return dao.getPayoutsByDateWithStatus(details?.start_date, details?.end_date,details?.status)
          .then((userDetails)=>{
            
            if(userDetails)
            {
              // console.log(userDetails)
              
              return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, userDetails)
              
             }else{
               return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)
               
             }
           })
        }
        else{
          return mapper.responseMapping(usrConst.CODE.BadRequest, "invalid details");

        }
   }  else if (response == false) {
       return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
     } else {
       return response;
     }
   
 })
} else {
   return mapper.responseMapping(usrConst.CODE.BadRequest, "invalid details");
 }
   
}

async function getAllPayoutsDataMerchant(details) {
  // console.log(details)
  if(details &&details?.start_date&& details?.end_date&& details?.status&&details?.email_Id)  {
 return validateRequest(details)
 .then((response)=>{
   if(response==true)
   {
    
      if(details?.status=="all"&&details?.start_date&&details?.end_date&&details?.email_Id)
       {

         return dao.getPayoutsByDateMerchant(details?.start_date, details?.end_date,details?.email_Id)
         .then((userDetails)=>{
           
           if(userDetails)
           {
             // console.log(userDetails)
             
             return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, userDetails)
             
            }else{
              return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)
              
            }
          })
        }
        if(details?.status=="success"||details?.status=="failed"||details?.status=="pending"&&details?.start_date=="all"&&details?.end_date=="all"&&details?.email_Id&&
        details?.limit>0&& details?.skip>=0
        )
       {

         return dao.getPayoutsByStatusMerchant(details?.email_Id,details?.status, details?.limit, details?.skip)
         .then((userDetails)=>{
           
           if(userDetails)
           {
             // console.log(userDetails)
             
             return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, userDetails)
             
            }else{
              return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)
              
            }
          })
        }
        else if(details?.status=="success"||details?.status=="failed"||details?.status=="pending"&&details?.start_date&&details?.end_date)
        {
          return dao.getPayoutsByDateWithStatusMerchant(details?.start_date, details?.end_date,details?.email_Id,details?.status)
          .then((userDetails)=>{
            
            if(userDetails)
            {
              // console.log(userDetails)
              
              return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, userDetails)
              
             }else{
               return mapper.responseMapping(usrConst.CODE.BadRequest, usrConst.MESSAGE.InvalidDetails)
               
             }
           })
        }
        else{
          return mapper.responseMapping(usrConst.CODE.BadRequest, "invalid details");

        }
   }  else if (response == false) {
       return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
     } else {
       return response;
     }
   
 })
} else {
   return mapper.responseMapping(usrConst.CODE.BadRequest, "invalid details");
 }
   
}



module.exports ={
    getPayoutBalance,

    getPayoutData,

    sendPaymentRequest,

    getAllPayoutTransactions,

    getPayoutDataMerchant,

    getPayoutDataById,

    getAllPayoutsData,

    getAllPayoutsDataMerchant,

    getAllPayoutTransactionsMerchant
  }
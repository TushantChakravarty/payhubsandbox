/*#################################            Load modules start            ########################################### */
// require('@pancakeswap-libs/sdk')
const dao = require("./userDao");
const adminDao = require("../admin/adminDao");
const usrConst = require("../utils/userConstants");
const mapper = require("../utils/userMapper");
const constants = require("../../constants");
const appUtils = require("../../appUtils");
const jwtHandler = require("../../jwtHandler");
const ObjectId = require("mongoose").Types.ObjectId;
const appUtil = require("../../appUtils");
const mongoose = require("mongoose");
var WebSocket = require("ws");
const conn = mongoose.connection;
const Email = require("../utils/userEmail");
const Template = require("../utils/emailTemplate");
const moment = require("moment-timezone");
const crypto = require("crypto");
const fs = require("fs");
const fetch = require("cross-fetch");

const TopupTransactions = require('../../generic/models/topupModel')
// const market = require('../Market/marketDao')
const {
  processTransactionTest2,
  processPayinRequest,
  processPayinRequestBank,
  bazorPay,
  processPayinRequestBazorpay,
  fetchBazorpayPaymentStatus,
  fetchPayintStatus,
  fetchPayintStatusBz,
} = require("../../gateways/paymentController");
const {
  pinwalletPayin,
  generatePinWalletToken,
  pinwalletPayout,
} = require("../../gateways/pinwallet");
const { intentPayPayin } = require("../../gateways/intentpay");
const {
  generateTokenPaythrough,
  paythroughyPayin,
  paythroughyPayinIntent,
  fetchPaythroughStatus,
} = require("../../gateways/paythrough");
const querystring = require("querystring");
const {
  sendAirpayQrRequest,
  encryptAirpayRequest,
  decryptAirpayResponse,
  check,
  check2,
  airpayPayin,
} = require("../../gateways/airpay");
const forge = require("node-forge");
const CryptoJS = require("crypto-js");
const {
  sendSwipelineQrRequest,
  swipeLineUpi,
  sendPayoutRequestSwipelineIMPS,
} = require("../../gateways/swipeline");
const { newPayment, newPaymentQR } = require("../../gateways/phonepe");
const { updateTransactionsData } = require("../utils/transactionDao");
const { createTransaction } = require("../transactionsDao/TransactionDao");
const { addMerchant } = require("../sandbox/sandbox");
const { paytmePayin, paytmePaymentQr, paytmePaymentPage } = require("../../gateways/paytme");
const { generateQrCode } = require("../../gateways/payhub");

/*#################################            Load modules end            ########################################### */

/**
 * Register user
 * @param {Object} details user details to get registered
 */

async function validateRequest(details) {
  let query = {
    emailId: details.emailId,
  };
  return dao.getUserDetails(query).then(async (userExists) => {
    if (userExists) {
      console.log(details?.apiKey)
      const decryptedKey = appUtils.decryptText(details.apiKey);
      console.log("validate decrypted key", decryptedKey);
      if (decryptedKey == userExists.apiKey) {
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

async function validateAdminRequest(details) {
  let query = {
    emailId: details.email_Id,
  };
  return adminDao.getUserDetails(query).then(async (userExists) => {
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
function register(details) {
  if (!details || Object.keys(details).length == 0) {
    return mapper.responseMapping(
      usrConst.CODE.BadRequest,
      usrConst.MESSAGE.InvalidDetails
    );
  } else {
    return validateAdminRequest(details).then((response) => {
      if (response == true) {
        if (details.emailId) {
          let query = {
            emailId: details.emailId,
          };

          return dao
            .getUserAccount(query)
            .then(async (userExists) => {
              if (userExists) {
                return mapper.responseMapping(
                  usrConst.CODE.BadRequest,
                  usrConst.MESSAGE.EmailAlreadyExists
                );
              } else {
                // let convertedPass = await appUtil.convertPass(details.password);
                // details.password = convertedPass

                // let verificationCode = Math.floor(Math.random() * (999999 - 100000) + 100000)
                // console.log({ verificationCode })

                // details.OTP = verificationCode
                // details.isEmailVerified=false

                /*
                                 details.otpUpdatedAt = new Date().getTime()
                                 details.createdAt = new Date().getTime()
                                 details.isIdentityVerified = false
                                
                                 let loginActivity = []
                                 loginActivity.push({
                                    
                                     status: 'active'
                                 })*/

                // details.loginActivity = loginActivity
                let password = appUtils.generatePassword(
                  20,
                  "123456789abcdefghijklmnopqrstuvwxyz"
                );
                let convertedPass = await appUtil.convertPass(password);
                details.password = convertedPass;
                const apiKey = Math.random().toString(36).slice(2);
                console.log(apiKey);
                const encKey = Math.random().toString(36).slice(2);
                const encrytedKey = appUtils.encryptText(apiKey);
                console.log("encrypted key", encrytedKey);
                details.apiKey = apiKey;
                details.balance = 0;
                details.encryptionKey = encKey
               // addMerchant(details)
                /*   let mailSent = Email.sendMessage( details.emailId)
                                   console.log({ mailSent })*/

                return dao
                  .createUser(details)
                  .then((userCreated) => {
                    if (userCreated) {
                      //             const EmailTemplate=Template.register(details.OTP)
                      // //console.log(isExist.emailId)
                      //            let mailSent = Email.sendMessage2(details.emailId,EmailTemplate)
                      //             console.log(mailSent)
                      // let filteredUserResponseFields = mapper.filteredUserResponseFields(userCreated)
                      let responseData = {
                        email: userCreated[0].emailId,
                        password: password,
                        apiKey: encrytedKey,
                      };
                      console.log(responseData);
                      return mapper.responseMappingWithData(
                        usrConst.CODE.Success,
                        usrConst.MESSAGE.Success,
                        responseData
                      );
                    } else {
                      console.log("Failed to save user");
                      return mapper.responseMapping(
                        usrConst.CODE.INTRNLSRVR,
                        usrConst.MESSAGE.internalServerError
                      );
                    }
                  })
                  .catch((err) => {
                    console.log({ err });
                    return mapper.responseMapping(
                      usrConst.CODE.INTRNLSRVR,
                      usrConst.MESSAGE.internalServerError
                    );
                  });
              }
            })
            .catch((err) => {
              console.log({ err });
              return mapper.responseMapping(
                usrConst.CODE.INTRNLSRVR,
                usrConst.MESSAGE.internalServerError
              );
            });
        }
      } else if (response == false) {
        return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
      } else {
        return response;
      }
    });
  }
}

function confirmOtp(details) {
  if (!details) {
    return mapper.responseMapping(
      usrConst.CODE.BadRequest,
      usrConst.MESSAGE.InvalidDetails
    );
  } else {
    if (details.emailId) {
      let query = {
        emailId: details.emailId,
      };

      return dao
        .getUserDetails(query)
        .then(async (userExists) => {
          if (!userExists) {
            return mapper.responseMapping(
              usrConst.CODE.BadRequest,
              "user does not exist"
            );
          } else {
            console.log(userExists);
            if (userExists.OTP == details.otp) {
              let updateObj = {
                isEmailVerified: true,
              };

              return dao.updateProfile(query, updateObj).then((userUpdated) => {
                if (userUpdated) {
                  // let usrObj = {
                  //     _id: userUpdated._id,
                  //     emailId: userUpdated.emailId,
                  //     contactNumber: userUpdated.contactNumber
                  // }
                  // return jwtHandler.genUsrToken(usrObj).then((token) => {
                  console.log("success");
                  return mapper.responseMapping(
                    usrConst.CODE.Success,
                    usrConst.MESSAGE.Success
                  );
                } else {
                  console.log("error");
                  return mapper.responseMapping(
                    usrConst.CODE.INTRNLSRVR,
                    "server error"
                  );
                }
              });
            } else {
              console.log("invalid otp");
              return mapper.responseMapping(
                usrConst.CODE.InvalidOtp,
                "invalid OTP"
              );
            }
          }
        })
        .catch((err) => {
          console.log({ err });
          return mapper.responseMapping(
            usrConst.CODE.INTRNLSRVR,
            usrConst.MESSAGE.internalServerError
          );
        });
    }
  }
}

/**
 * Login
 * @param {Object} details user details
 */
function login(details) {
  if (!details.emailId && !details.password) {
    return mapper.responseMapping(
      usrConst.CODE.BadRequest,
      usrConst.MESSAGE.InvalidDetails
    );
  } else {
    let query = {};
    if (details.emailId) {
      query.emailId = details.emailId.toLowerCase();
    }
    // if (details.contactNumber) {

    //     query.contactNumber = details.contactNumber
    // }

    return dao
      .getUserDetails(query)
      .then(async (userDetails) => {
        console.log(query);
        //console.log(userDetails)

        if (userDetails) {
          // if (!userDetails.isEmailVerified) {
          //     return mapper.responseMapping(401, 'Please verify your account first')
          // }

          let isValidPassword = await appUtils.verifyPassword(
            details,
            userDetails
          );
          //let isValidPassword = true;
          console.log(isValidPassword);

          if (isValidPassword) {
            let token = await jwtHandler.genUsrToken(details);
            console.log(token);
            details.token = token;
            let updateObj = {
              token: token,
            };

            return dao
              .updateProfile(query, updateObj)
              .then((userUpdated) => {
                if (userUpdated) {
                  //console.log('success', userUpdated)
                  updateObj.emailId = userUpdated.emailId;
                  const apiKey = appUtils.encryptText(userUpdated.apiKey);
                  updateObj.apiKey = apiKey;
                  return mapper.responseMappingWithData(
                    usrConst.CODE.Success,
                    usrConst.MESSAGE.Success,
                    updateObj
                  );
                } else {
                  console.log("Failed to update ");
                  return mapper.responseMapping(
                    usrConst.CODE.INTRNLSRVR,
                    usrConst.MESSAGE.internalServerError
                  );
                }
              })
              .catch((err) => {
                console.log({ err });
                return mapper.responseMapping(
                  usrConst.CODE.INTRNLSRVR,
                  usrConst.MESSAGE.internalServerError
                );
              });
          } else {
            return mapper.responseMapping(
              405,
              usrConst.MESSAGE.InvalidPassword
            );
          }
        } else {
          return mapper.responseMapping(
            usrConst.CODE.DataNotFound,
            usrConst.MESSAGE.UserNotFound
          );
        }
      })
      .catch((err) => {
        console.log({ err });
        return mapper.responseMapping(
          usrConst.CODE.INTRNLSRVR,
          usrConst.MESSAGE.internalServerError
        );
      });
  }
}

function resetPassword(details) {
  if (!details.emailId && !details.password && !details.newPassword) {
    return mapper.responseMapping(
      usrConst.CODE.BadRequest,
      usrConst.MESSAGE.InvalidDetails
    );
  } else {
    let query = {};
    if (details.emailId) {
      query.emailId = details.emailId.toLowerCase();
    }
    // if (details.contactNumber) {

    //     query.contactNumber = details.contactNumber
    // }

    return dao
      .getUserDetails(query)
      .then(async (userDetails) => {
        console.log(query);
        //console.log(userDetails)

        if (userDetails) {
          // if (!userDetails.isEmailVerified) {
          //     return mapper.responseMapping(401, 'Please verify your account first')
          // }

          let isValidPassword = await appUtils.verifyPassword(
            details,
            userDetails
          );
          //let isValidPassword = true;
          console.log(isValidPassword);

          if (isValidPassword) {
            let token = await jwtHandler.genUsrToken(details);
            console.log(token);
            details.token = token;
            let convertedPass = await appUtil.convertPass(details.newPassword);

            let updateObj = {
              token: token,
              password: convertedPass,
            };

            return dao
              .updateProfile(query, updateObj)
              .then((userUpdated) => {
                if (userUpdated) {
                  //console.log('success', userUpdated)
                  updateObj.emailId = userUpdated.emailId;
                  updateObj.newPassword = details.newPassword;
                  return mapper.responseMappingWithData(
                    usrConst.CODE.Success,
                    usrConst.MESSAGE.Success,
                    updateObj
                  );
                } else {
                  console.log("Failed to update ");
                  return mapper.responseMapping(
                    usrConst.CODE.INTRNLSRVR,
                    usrConst.MESSAGE.internalServerError
                  );
                }
              })
              .catch((err) => {
                console.log({ err });
                return mapper.responseMapping(
                  usrConst.CODE.INTRNLSRVR,
                  usrConst.MESSAGE.internalServerError
                );
              });
          } else {
            return mapper.responseMapping(
              405,
              usrConst.MESSAGE.InvalidPassword
            );
          }
        } else {
          return mapper.responseMapping(
            usrConst.CODE.DataNotFound,
            usrConst.MESSAGE.UserNotFound
          );
        }
      })
      .catch((err) => {
        console.log({ err });
        return mapper.responseMapping(
          usrConst.CODE.INTRNLSRVR,
          usrConst.MESSAGE.internalServerError
        );
      });
  }
}

/**
 * Forgot password
 * @param {String} emailId email id of user to send password recovery link
 */
function forgotPassword(emailId) {
  if (!emailId) {
    return mapper.responseMapping(
      usrConst.CODE.BadRequest,
      usrConst.MESSAGE.InvalidDetails
    );
  } else {
    let query = {
      emailId: emailId,
    };
    return dao
      .getUserDetails(query)
      .then(async (isExist) => {
        if (isExist) {
          console.log(isExist._id);
          const EmailTemplate = Template.forgotPassword(isExist._id);
          //console.log(isExist.emailId)
          let mailSent = Email.sendMessage2(isExist.emailId, EmailTemplate);
          console.log(mailSent);
          //mailHandler.SEND_MAIL(usrObj, templateDetails, serviceDetails)

          return mapper.responseMapping(
            usrConst.CODE.Success,
            usrConst.MESSAGE.ResetPasswordMailSent
          );
        } else {
          return mapper.responseMapping(
            usrConst.CODE.DataNotFound,
            usrConst.MESSAGE.InvalidCredentials
          );
        }
      })
      .catch((e) => {
        console.log({ e });
        return mapper.responseMapping(
          usrConst.CODE.INTRNLSRVR,
          usrConst.MESSAGE.internalServerError
        );
      });
  }
}

/**
 * Set new password
 * @param {string} redisId redis id for recovering password
 * @param {string} password new password to set
 */
async function setNewPassword(redisId, password) {
  if (!redisId || !password) {
    return mapper.responseMapping(
      usrConst.CODE.BadRequest,
      usrConst.MESSAGE.InvalidDetails
    );
  } else {
    console.log(redisId);
    let query = {
      _id: redisId,
    };

    // let isUserExists = await dao.getUserDetails(query)
    let isUserExists = await dao.getUserDetails(query);
    console.log(isUserExists);
    //redisServer.getRedisDetails(redisId)

    if (isUserExists) {
      let newPass = await appUtils.convertPass(password);

      let query = {
        _id: redisId,
      };
      let updateObj = {
        password: newPass,
      };
      return dao
        .updateProfile(query, updateObj)
        .then(async (updateDone) => {
          if (updateDone) {
            //await dao.getServiceDetails(thirdPartyServiceQuery)
            let mailConfig = Email.sendMessage(isUserExists.emailId);
            console.log(mailConfig);
            //mailHandler.SEND_MAIL(mailBodyDetails, templateDetails, serviceDetails)

            return mapper.responseMapping(
              usrConst.CODE.Success,
              usrConst.MESSAGE.PasswordUpdateSuccess
            );
          } else {
            console.log("Failed to reset password");
            return mapper.responseMapping(
              usrConst.CODE.INTRNLSRVR,
              usrConst.MESSAGE.internalServerError
            );
          }
        })
        .catch((e) => {
          console.log({ e });
          return mapper.responseMapping(
            usrConst.CODE.INTRNLSRVR,
            usrConst.MESSAGE.internalServerError
          );
        });
    } else {
      return mapper.responseMapping(
        usrConst.CODE.DataNotFound,
        usrConst.MESSAGE.ResetPasswordLinkExpired
      );
    }
  }
}

async function updateProfile(details) {
  return validateRequest(details).then((response) => {
    if (response == true) {
      const query = {
        emailId: details.emailId,
      };

      return dao.updateProfile(query, details).then((userUpdated) => {
        if (userUpdated) {
          // console.log('success', userUpdated)

          return mapper.responseMappingWithData(
            usrConst.CODE.Success,
            usrConst.MESSAGE.Success,
            "updated"
          );
        } else {
          console.log("Failed to update ");
          return mapper.responseMapping(
            usrConst.CODE.INTRNLSRVR,
            usrConst.MESSAGE.internalServerError
          );
        }
      });
    } else if (response == false) {
      return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
    } else {
      return mapper.responseMapping(usrConst.CODE.BadRequest, response);
    }
  });
}

async function updateCallbackUrl(details) {
  return validateRequest(details).then((response) => {
    if (response == true) {
      const query = {
        emailId: details.emailId,
      };
      let updateDetails = {
        callbackUrl: details.callbackUrl,
      };

      return dao.updateProfile(query, updateDetails).then((userUpdated) => {
        if (userUpdated) {
          // console.log('success', userUpdated)

          return mapper.responseMappingWithData(
            usrConst.CODE.Success,
            usrConst.MESSAGE.Success,
            "success"
          );
        } else {
          console.log("Failed to update ");
          return mapper.responseMapping(
            usrConst.CODE.INTRNLSRVR,
            usrConst.MESSAGE.internalServerError
          );
        }
      });
    } else if (response == false) {
      return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
    } else {
      return mapper.responseMapping(usrConst.CODE.BadRequest, response);
    }
  });
}

async function updateRedirectUrl(details) {
  return validateRequest(details).then((response) => {
    if (response == true) {
      const query = {
        emailId: details.emailId,
      };
      let updateDetails = {
        redirectUrl: details.redirectUrl,
      };

      return dao.updateProfile(query, updateDetails).then((userUpdated) => {
        if (userUpdated) {
          //console.log('success', userUpdated)

          return mapper.responseMappingWithData(
            usrConst.CODE.Success,
            usrConst.MESSAGE.Success,
            userUpdated
          );
        } else {
          console.log("Failed to update ");
          return mapper.responseMapping(
            usrConst.CODE.INTRNLSRVR,
            usrConst.MESSAGE.internalServerError
          );
        }
      });
    } else if (response == false) {
      return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
    } else {
      return mapper.responseMapping(usrConst.CODE.BadRequest, response);
    }
  });
}


async function updateTransaction(details) {
  return validateRequest(details).then((response) => {
    if (response == true) {
      const query = {
        emailId: details.emailId,
      };
      let updateObj = {
        status: details.status,
      };
      // if(details.balance&&details.balance!=null)
      // {
      //     let updateObj={}
      //     updateObj.balance = details.balance
      //     // let updatedBalance = details.balance
      //     // updateObj.balance = updatedBalance
      //      dao.updateProfile(query, updateObj)
      // }
      console.log(details);

      return dao
        .updateTransactionData(query, details.transactionId, updateObj)
        .then((userUpdated) => {
          if (userUpdated) {
            // console.log('success', userUpdated)

            return mapper.responseMappingWithData(
              usrConst.CODE.Success,
              usrConst.MESSAGE.Success,
              userUpdated
            );
          } else {
            console.log("Failed to update ");
            return mapper.responseMapping(
              usrConst.CODE.INTRNLSRVR,
              usrConst.MESSAGE.internalServerError
            );
          }
        });
    } else if (response == false) {
      return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
    } else {
      return mapper.responseMapping(usrConst.CODE.BadRequest, response);
    }
  });
}

///test payouts 
async function sendPaymentRequest(details) {
  return await validateRequest(details).then(async (response) => {
    console.log(response);
    // return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, response)

    if (response == true) {
      let query = {
        emailId: details.emailId,
      };
      console.log(details);
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
            if(response)
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
///payin requests

async function sendPayinRequest(details) {
  
  // return mapper.responseMappingWithData(usrConst.CODE.BadRequest, usrConst.MESSAGE.TransactionFailure, 'under maintainance')
  // return await validateRequest(details).then(async (response) => {
  //   console.log(response);
  //   // return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, response)
  //   if (response == true) {
    if(details.amount<10)
    {
     return mapper.responseMappingWithData(usrConst.CODE.BadRequest, usrConst.MESSAGE.TransactionFailure, 'amount must be greater than 10')
    }
    if(!details.amount||details.amount =="")
    {
     return mapper.responseMappingWithData(usrConst.CODE.BadRequest, usrConst.MESSAGE.TransactionFailure, 'invalid amount')
    }
    function parseUrl(url) {
      const urlObject = new URL(url);
      const params = new URLSearchParams(urlObject.search);
      return {
        pa: params.get("pa"),
        pn: params.get("pn"),
        tn: params.get("tn"),
        tr: params.get("tr"),
        am: params.get("am"),
        cu: params.get("cu"),
      };
    }
  
    function generateNewUrl(baseUrl, params) {
      const urlObject = new URL(baseUrl);
      urlObject.searchParams.set("pa", params.pa);
      urlObject.searchParams.set("pn", params.pn);
      urlObject.searchParams.set("tn", params.tn);
      urlObject.searchParams.set("tr", params.tr);
      urlObject.searchParams.set("am", params.am);
      urlObject.searchParams.set("cu", params.cu);
      return urlObject.href;
    }
      
      let query = {
        emailId: details.emailId,
      };
      return dao.getUserDetails(query).then(async (userData) => {
        let gateway = "payhub";
        let redirectUrl = userData.redirectUrl;
        let uuid = userData._id;
       // console.log(redirectUrl);
        if (userData.isBanned)
          return mapper.responseMapping(
            usrConst.CODE.FRBDN,
            "You are banned from making transactions.Please contact admin"
          );
        if (gateway) {
       
          if(gateway == "payhub")
          {
            const timeElapsed = Date.now();
    
            // const gatewayUpdate = {
            //   last24hrTotal: gatewayData.last24hrTotal + 1,
            //   totalTransactions: gatewayData.totalTransactions + 1,
            // };
    
            //console.log("gatewayData", gatewayUpdate);
    
            const today = new Date(timeElapsed);
            const response = await generateQrCode(details.amount)
            const updateDetails = {
              transactionId: response.transactionId,
              merchant_ref_no: response.transactionId,
              amount: details.amount,
              currency: "inr",
              country: "in",
              status: "IN-PROCESS",
              hash: "xyzPaythrough",
              payout_type: "PAYIN",
              message: "IN-PROCESS",
              transaction_date: today.toISOString(),
              gateway: gateway,
              phone: details.phone ? details.phone : "",
              username: details.username ? details.username : "",
              upiId: details.upiId ? details.upiId : "",
              customer_email: details.customer_email,
              business_name: userData.business_name,
              uuid: String(uuid),
              // Add other fields as needed
            };
    
            // adminDao.updateGatewayDetailsPayin("paythrough", gatewayUpdate);
            createTransaction(updateDetails);
            // const token = await jwtHandler.generatePageExpiryToken(
            //   details.emailId,
            //   details.apiKey
            // );
            const originalUrl = response.upiUrl;
            const parsedUrl = parseUrl(originalUrl);
    
            const paytmUrl = generateNewUrl("paytmmp://upi/pay", parsedUrl);
            const gpayUrl = generateNewUrl("tez://upi/pay", parsedUrl);
            const phonepeUrl = generateNewUrl("phonepe://upi/pay", parsedUrl);
    
           
    
           
            return mapper.responseMappingWithData(
              usrConst.CODE.Success,
              usrConst.MESSAGE.Success,
              {
                url: originalUrl,
                gpay:gpayUrl,
                phonepe:phonepeUrl,
                paytm:paytmUrl,
                transaction_id: response.transactionId,
              }
            );
          }

         
        } else {
          return mapper.responseMapping(
            usrConst.CODE.INTRNLSRVR,
            usrConst.MESSAGE.InvalidDetails
          );
        }
      });
  //   } else if (response == false) {
  //     return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
  //   } else {
  //     return response;
  //   }
  // });
}

async function sendPayinRequestPage(details) {
  function parseUrl(url) {
    const urlObject = new URL(url);
    const params = new URLSearchParams(urlObject.search);
    return {
      pa: params.get("pa"),
      pn: params.get("pn"),
      tn: params.get("tn"),
      tr: params.get("tr"),
      am: params.get("am"),
      cu: params.get("cu"),
    };
  }
  
  function generateNewUrl(baseUrl, params) {
    const urlObject = new URL(baseUrl);
    urlObject.searchParams.set("pa", params.pa);
    urlObject.searchParams.set("pn", params.pn);
    urlObject.searchParams.set("tn", params.tn);
    urlObject.searchParams.set("tr", params.tr);
    urlObject.searchParams.set("am", params.am);
    urlObject.searchParams.set("cu", params.cu);
    return urlObject.href;
  }
  
  function buildPaymentUrl(details, username, response, encodedUri, redirectUrl, gpay, phonepe, paytm, token) {
    let url = `https://payments.payhub.link/?amount=${details.amount}&email=${details.emailId}&phone=${details.phone}&username=${username}&txid=${response.transaction_id}&gateway=payhubpt&qr=${encodedUri}&upi=${encodedUri}&url=${redirectUrl}&gpay=${gpay}&phonepe=${phonepe}&paytm=${paytm}&token=${token}`;
    return url;
  }
  
  function appendQueryParameter(originalUrl, paramName, paramValue) {
    const parsedUrl = new URL(originalUrl);
    parsedUrl.search = `?${paramName}=${paramValue}`;
    return parsedUrl.toString();
  }
  // return mapper.responseMappingWithData(usrConst.CODE.BadRequest, usrConst.MESSAGE.TransactionFailure, 'under maintainance')
  // return await validateRequest(details).then(async (response) => {
  //   console.log(response);
    // return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, response)
    // if (response == true) {
     if(details.amount<10)
     {
      return mapper.responseMappingWithData(usrConst.CODE.BadRequest, usrConst.MESSAGE.TransactionFailure, 'amount must be greater than 10')
     }
     if(!details.amount||details.amount =="")
     {
      return mapper.responseMappingWithData(usrConst.CODE.BadRequest, usrConst.MESSAGE.TransactionFailure, 'invalid amount')
     }
      console.log(details);
     
      let query = {
        emailId: details.emailId,
      };
      return dao.getUserDetails(query).then(async (userData) => {
        let gateway = 'payhub';
        let redirectUrl = userData.redirectUrl;
        let uuid = userData._id;
        console.log(redirectUrl);
        if (userData.isBanned)
          return mapper.responseMapping(
            usrConst.CODE.FRBDN,
            "You are banned from making transactions.Please contact admin"
          );
        if (gateway) {

          if (gateway == "airpay") {
            // Sample data

            // Sample data

            const referenceId = Math.floor(Math.random() * 1000000000);
            //console.log('ref',referenceId);
            const response = await airpayPayin(referenceId, details);
            //console.log("qr", JSON.parse(response));
            if (JSON.parse(response).status == 200) {
              const timeElapsed = Date.now();

              // const gatewayData = await adminDao.getGatewayDetails(
              //   "paythrough"
              // );
              // const gatewayUpdate = {
              //   last24hrTotal: gatewayData.last24hrTotal + 1,
              //   totalTransactions: gatewayData.totalTransactions + 1,
              // };
              // console.log('gatewayData', gatewayUpdate)
              const today = new Date(timeElapsed);
              const query = {
                emailId: details.emailId,
              };
              const updateDetails = {
                transactionId: JSON.parse(response).RID,
                merchant_ref_no: referenceId,
                amount: details.amount,
                currency: "inr",
                country: "in",
                status: "IN-PROCESS",
                hash: "xyzAirpay",
                payout_type: "PAYIN",
                message: "IN-PROCESS",
                transaction_date: today.toISOString(),
                gateway: gateway,
                phone: details.phone ? details.phone : "",
                username: details.username ? details.username : "",
                upiId: details.upiId ? details.upiId : "",
                customer_email: details.customer_email,
                business_name: userData.business_name,
              };

              //adminDao.updateGatewayDetailsPayin("airpay", gatewayUpdate);
              let newData = updateDetails;
              newData.uuid = String(uuid);
              createTransaction(newData);
              //updateTransactionsData(updateDetails)
              ///dao.updateTransaction(query, updateDetails);
              const originalUrl = JSON.parse(response).QRCODE_STRING;
              const parseUrl = (url) => {
                const urlObject = new URL(url);
                const params = new URLSearchParams(urlObject.search);
                return {
                  pa: params.get("pa"),
                  pn: params.get("pn"),
                  tn: params.get("tn"),
                  tr: params.get("tr"),
                  am: params.get("am"),
                  cu: params.get("cu"),
                };
              };

              const generateNewUrl = (baseUrl, params) => {
                const urlObject = new URL(baseUrl);
                urlObject.searchParams.set("pa", params.pa);
                urlObject.searchParams.set("pn", params.pn);
                urlObject.searchParams.set("tn", params.tn);
                urlObject.searchParams.set("tr", params.tr);
                urlObject.searchParams.set("am", params.am);
                urlObject.searchParams.set("cu", params.cu);
                return urlObject.href;
              };

              const paytmUrl = generateNewUrl(
                "paytmmp://upi/pay",
                parseUrl(originalUrl)
              );
              const gpayUrl = generateNewUrl(
                "tez://upi/pay",
                parseUrl(originalUrl)
              );
              const phonepeUrl = generateNewUrl(
                "phonepe://upi/pay",
                parseUrl(originalUrl)
              );

              // console.log("Paytm URL:", paytmUrl);
              // console.log("Google Pay URL:", gpayUrl);
              // console.log("PhonePe URL:", phonepeUrl);
              const gpay = encodeURIComponent(gpayUrl);
              const phonepe = encodeURIComponent(phonepeUrl);
              const paytm = encodeURIComponent(paytmUrl);
              const encodedUri = encodeURIComponent(
                JSON.parse(response).QRCODE_STRING
              );
              const token = await jwtHandler.generatePageExpiryToken(
                details.emailId,
                details.apiKey
              );
              const username = details.username.replace(/\s/g, "");
              let url = `https://payments.payhub.link/?amount=${
                details.amount
              }&email=${details.emailId}&phone=${
                details.phone
              }&username=${username}&txid=${
                JSON.parse(response).RID
              }&gateway=payhubA&qr=${encodedUri}&upi=${encodedUri}&gpay=${gpay}&phonepe=${phonepe}&paytm=${paytm}&token=${token}`;
              if (redirectUrl) {
                const originalUrl = redirectUrl;

                // Parse the URL
                const parsedUrl = new URL(originalUrl);

                // Append query parameter
                parsedUrl.search = `?txId=${JSON.parse(response).RID}`;

                // Get the modified URL
                const modifiedUrl = parsedUrl.toString();

                url = `https://payments.payhub.link/?amount=${
                  details.amount
                }&email=${details.emailId}&phone=${
                  details.phone
                }&username=${username}&txid=${
                  JSON.parse(response).RID
                }&gateway=payhubA&qr=${encodedUri}&url=${modifiedUrl}&upi=${encodedUri}&gpay=${gpay}&phonepe=${phonepe}&paytm=${paytm}&token=${token}`;
              }
              return mapper.responseMappingWithData(
                usrConst.CODE.Success,
                usrConst.MESSAGE.Success,
                {
                  url: url,
                  //url:JSON.parse(response).QRCODE_STRING,
                 // upiUrl: JSON.parse(response).QRCODE_STRING,
                  transaction_id: JSON.parse(response).RID,
                }
              );
            } else {
              return mapper.responseMappingWithData(
                usrConst.CODE.INTRNLSRVR,
                usrConst.MESSAGE.internalServerError,
                response
              );
            }
          }

          if(gateway == "payhub")
          {
            const timeElapsed = Date.now();
    
            // const gatewayUpdate = {
            //   last24hrTotal: gatewayData.last24hrTotal + 1,
            //   totalTransactions: gatewayData.totalTransactions + 1,
            // };
    
            //console.log("gatewayData", gatewayUpdate);
    
            const today = new Date(timeElapsed);
            const response = await generateQrCode(details.amount)
            const updateDetails = {
              transactionId: response.transactionId,
              merchant_ref_no: response.transactionId,
              amount: details.amount,
              currency: "inr",
              country: "in",
              status: "IN-PROCESS",
              hash: "xyzPaythrough",
              payout_type: "PAYIN",
              message: "IN-PROCESS",
              transaction_date: today.toISOString(),
              gateway: gateway,
              phone: details.phone ? details.phone : "",
              username: details.username ? details.username : "",
              upiId: details.upiId ? details.upiId : "",
              customer_email: details.customer_email,
              business_name: userData.business_name,
              uuid: String(uuid),
              // Add other fields as needed
            };
    
            // adminDao.updateGatewayDetailsPayin("paythrough", gatewayUpdate);
            createTransaction(updateDetails);
            const token = await jwtHandler.generatePageExpiryToken(
              details.emailId,
              details.apiKey
            );
            const originalUrl = response.upiUrl;
            const parsedUrl = parseUrl(originalUrl);
    
            const paytmUrl = generateNewUrl("paytmmp://upi/pay", parsedUrl);
            const gpayUrl = generateNewUrl("tez://upi/pay", parsedUrl);
            const phonepeUrl = generateNewUrl("phonepe://upi/pay", parsedUrl);
    
            const gpay = encodeURIComponent(gpayUrl);
            const phonepe = encodeURIComponent(phonepeUrl);
            const paytm = encodeURIComponent(paytmUrl);
            const encodedUri = encodeURIComponent(originalUrl);
    
            const username = details?.username?.replace(/\s/g, "");
            let url = `https://payments.payhub.link/?amount=${details.amount}&email=${details.emailId}&phone=${details.phone}&username=${username}&txid=${response.transactionId}&gateway=payhubpt&qr=${encodedUri}&upi=${encodedUri}&url=${redirectUrl}&gpay=${gpay}&phonepe=${phonepe}&paytm=${paytm}&token=${token}`;
    
            if (redirectUrl) {
              const modifiedUrl = appendQueryParameter(
                redirectUrl,
                "txId",
                response.transactionId
              );
              url = `https://payments.payhub.link//?amount=${details.amount}&email=${details.emailId}&phone=${details.phone}&username=${username}&txid=${response.transactionId}&gateway=payhubpt&qr=${encodedUri}&url=${modifiedUrl}&upi=${encodedUri}&gpay=${gpay}&phonepe=${phonepe}&paytm=${paytm}&token=${token}`;
            }
    
            return mapper.responseMappingWithData(
              usrConst.CODE.Success,
              usrConst.MESSAGE.Success,
              {
                url: url,
                transaction_id: response.transactionId,
              }
            );
          }
    
         
        } else {
          return mapper.responseMapping(
            usrConst.CODE.INTRNLSRVR,
            usrConst.MESSAGE.InvalidDetails
          );
        }
      });
    // } else if (response == false) {
    //   return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
    // } else {
    //   return response;
    // }
  // });
}

async function sendPayinRequestIntent(details) {
  return await validateRequest(details).then(async (response) => {
    console.log(response);
    return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, "under maintainance. please contact support")
    if (response == true) {
      console.log(details);

      let query = {
        emailId: details.emailId,
      };
      return dao.getUserDetails(query).then(async (userData) => {
        let gateway = "paythroughIntent"; //userData.premiumGateway
        let redirectUrl = userData.redirectUrl;
        let uuid = userData._id;

        console.log(redirectUrl);
        if (userData.isBanned)
          return mapper.responseMapping(
            usrConst.CODE.FRBDN,
            "You are banned from making transactions.Please contact admin"
          );
        if (gateway) {
          if (gateway == "paythroughIntent") {
            return generateTokenPaythrough().then((response) => {
              if (response) {
                details.access_token = response;
                return paythroughyPayin(details).then((response) => {
                  if (response.status_code == 200) {
                    const timeElapsed = Date.now();
                    const today = new Date(timeElapsed);
                    const query = {
                      emailId: details.emailId,
                    };
                    const updateDetails = {
                      transactionId: response.transaction_id,
                      merchant_ref_no: response.order_id,
                      amount: response.amount,
                      currency: "inr",
                      country: "in",
                      status: "IN-PROCESS",
                      hash: "xyzPaythrough",
                      payout_type: "PAYIN",
                      message: "IN-PROCESS",
                      transaction_date: today.toISOString(),
                      gateway: gateway,
                      phone: details.phone ? details.phone : "",
                      username: details.username ? details.username : "",
                      upiId: details.upiId ? details.upiId : "",
                      customer_email: details.customer_email,
                      business_name: userData.business_name,
                    };
                    //updateTransactionsData(updateDetails);
                    dao.updateTransaction(query, updateDetails);
                    let newData = updateDetails;
                    newData.uuid = String(uuid);
                    createTransaction(newData);
                    const resp = {
                      status_code: response.status_code,
                      status: response.status,
                      message: response.message,
                      amount: response.amount,
                      upi_id: response.upi_id,
                      invoice_id: response.invoice_id,
                      order_id: response.order_id,
                      transaction_id: response.transaction_id,
                    };

                    return mapper.responseMappingWithData(
                      usrConst.CODE.Success,
                      usrConst.MESSAGE.Success,
                      resp
                    );
                  } else {
                    return mapper.responseMappingWithData(
                      usrConst.CODE.INTRNLSRVR,
                      usrConst.MESSAGE.internalServerError,
                      response
                    );
                  }
                });
                // const encodedUri = encodeURIComponent(response.upiIntent)
                // const decodeUri = decodeURIComponent(encodedUri)
                // console.log(decodeUri)
                // let url = `https://payments.payhub.link/?amount=${details.amount}&email=${details.emailId}&phone=${details.phone}&username=${details.username}&txid=${response.transactionId}&gateway=payhubi&qr=${encodedUri}`
              } else {
                return mapper.responseMapping(
                  usrConst.CODE.INTRNLSRVR,
                  usrConst.MESSAGE.internalServerError
                );
              }
            });
          }
        } else {
          return mapper.responseMapping(
            usrConst.CODE.INTRNLSRVR,
            usrConst.MESSAGE.InvalidDetails
          );
        }
      });
    } else if (response == false) {
      return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
    } else {
      return response;
    }
  });
}

async function sendPayinRequestCollect(details) {
  return mapper.responseMapping(
    usrConst.CODE.INTRNLSRVR,
    usrConst.MESSAGE.internalServerError
  );
  return await validateRequest(details).then(async (response) => {
    console.log(response);
    // return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, response)
    if (response == true) {
      console.log(details);

      let query = {
        emailId: details.emailId,
      };
      return dao.getUserDetails(query).then(async (userData) => {
        let gateway = "phonepeCollect"; //userData.premiumGateway
        let redirectUrl = userData.redirectUrl;
        console.log(redirectUrl);
        if (userData.isBanned)
          return mapper.responseMapping(
            usrConst.CODE.FRBDN,
            "You are banned from making transactions.Please contact admin"
          );
        if (gateway) {
          if (gateway == "phonepeCollect") {
            return newPayment(details).then((response) => {
              console.log(response);
              if (response.success == true) {
                const timeElapsed = Date.now();
                const today = new Date(timeElapsed);
                const query = {
                  emailId: details.emailId,
                };
                const updateDetails = {
                  transactionId: response.data.merchantTransactionId,
                  merchant_ref_no: response.data.merchantId,
                  amount: details.amount,
                  currency: "inr",
                  country: "in",
                  status: "IN-PROCESS",
                  hash: "xyzPhonepe",
                  payout_type: "PAYIN",
                  message: "IN-PROCESS",
                  transaction_date: today.toISOString(),
                  gateway: gateway,
                  phone: details.phone ? details.phone : "",
                  username: details.username ? details.username : "",
                  upiId: details.upiId ? details.upiId : "",
                };
                dao.updateTransaction(query, updateDetails);
                const resp = {
                  status: response.status,
                  message: response.message,
                  amount: details.amount,
                  transaction_id: response.data.merchantTransactionId,
                  transaction_date: today.toISOString(),
                  transaction_url:
                    response.data.instrumentResponse.redirectInfo.url,
                };

                return mapper.responseMappingWithData(
                  usrConst.CODE.Success,
                  usrConst.MESSAGE.Success,
                  resp
                );
              } else {
                return mapper.responseMappingWithData(
                  usrConst.CODE.INTRNLSRVR,
                  usrConst.MESSAGE.internalServerError,
                  response
                );
              }
            });
            // const encodedUri = encodeURIComponent(response.upiIntent)
            // const decodeUri = decodeURIComponent(encodedUri)
            // console.log(decodeUri)
            // let url = `https://payments.payhub.link/?amount=${details.amount}&email=${details.emailId}&phone=${details.phone}&username=${details.username}&txid=${response.transactionId}&gateway=payhubi&qr=${encodedUri}`
          } else {
            return mapper.responseMapping(
              usrConst.CODE.INTRNLSRVR,
              usrConst.MESSAGE.internalServerError
            );
          }
        }
      });
    } else if (response == false) {
      return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
    } else {
      return response;
    }
  });
}

async function sendPayinRequestBank(details) {
  return await validateRequest(details).then(async (response) => {
    console.log(response);
    // return mapper.responseMappingWithData(usrConst.CODE.Success, usrConst.MESSAGE.Success, response)
    if (response == true) {
      console.log(details);
      let bankDetails = {
        emailId: `${details.emailId}`,
        apiKey: `${details.apiKey}`,
        request_type: "deposit",
        data: {
          midcode: "30",
          payby: "upi",
          amount: details.amount,
          hash: "",
          currency: "inr",
          country: "in",
          notification_url: "string",
          return_url: "string",
          merchant_ref_no: "8788",
          firstname: "romesh",
          lastname: "sharma",
          city: "mumbai",
          address: "mumbai",
          state: "mh",
          zipcode: "495006",
          phone: "7890989899",
          ipaddress: "103.176.136.52",
          email: "na@gmail.com",
          vpa_address: details.upiId,
          checkout_type: "seamless",
          postcode: "495006",
          custom_field_1: "string",
          custom_field_2: "string",
          custom_field_3: "string",
          custom_field_4: "string",
          custom_field_5: "string",
          risk_data: {
            user_category: "default",
            device_fingerprint: "test",
          },
        },
      };

      const resp = await processPayinRequestBank(bankDetails);
      console.log(resp);
      if (resp.success == true) {
        const query = {
          emailId: details.emailId,
        };
        const updateDetails = {
          transactionId: resp.data.transaction_id,
          merchant_ref_no: resp.data.merchant_ref_no,
          amount: resp.data.amount,
          currency: resp.data.currency,
          country: resp.data.country,
          status: resp.data.status,
          hash: resp.data.hash,
          payout_type: resp.data.payout_type,
          message: resp.data.message,
          transaction_date: resp.data.transaction_date,
        };
        dao.updateTransaction(query, updateDetails);
        return mapper.responseMappingWithData(
          usrConst.CODE.Success,
          usrConst.MESSAGE.Success,
          "Payment request submitted"
        );
      } else {
        return mapper.responseMappingWithData(
          usrConst.CODE.BadRequest,
          usrConst.MESSAGE.InvalidDetails,
          resp
        );
      }
    } else if (response == false) {
      return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
    } else {
      return response;
    }
  });
}
//payin requests
async function getAllUserTransactions(details) {
  if (details.emailId && details.apiKey) {
    return await validateRequest(details).then(async (response) => {
      if (response == true) {
        const query = {
          emailId: details.emailId,
        };
        const response = await dao.getAllTransactions(query);
       // console.log("my response", response);
        if (response?.transactions != null)
          return mapper.responseMappingWithData(
            usrConst.CODE.Success,
            usrConst.MESSAGE.Success,
            response.transactions
          );
        else
          return mapper.responseMappingWithData(
            usrConst.CODE.Success,
            usrConst.MESSAGE.Success,
            []
          );
      } else if (response == false) {
        return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
      } else {
        return response;
      }
    });
  } else {
    return mapper.responseMapping(usrConst.CODE.BadRequest, "Invalid details");
  }
}

async function getAllUserSettlements(details) {
  if (details.emailId && details.apiKey) {
    return await validateRequest(details).then(async (response) => {
      if (response == true) {
        const response = await dao.getAllUserSettlements(details);
        if (response != null) {
          let allTx = [];
          response.map((item, index) => {
            let body = {
              amount: item.amount,
              currency: item.currency,
              country: item.country,
              transaction_date: item.transaction_date,
              ref_no: item.ref_no,
              notes: item.notes,
              txIndex: index,
              feeCharged: item.feeCharged,
              amountSettled: item.amountSettled,
              usdt: item.usdt ? item.usdt : 0,
            };
            // body.txIndex = index
            allTx.push(body);
          });
          const startIndex = details.skip;
          const endIndex = startIndex + details.limit;
          const reversed = allTx.sort(
            (a, b) =>
              new Date(b.transaction_date) - new Date(a.transaction_date)
          );
          const paginatedTransactions = reversed.slice(startIndex, endIndex);
          return mapper.responseMappingWithData(
            usrConst.CODE.Success,
            usrConst.MESSAGE.Success,
            paginatedTransactions
          );
        } else {
          return mapper.responseMappingWithData(
            usrConst.CODE.Success,
            usrConst.MESSAGE.Success,
            []
          );
        }
      } else if (response == false) {
        return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
      } else {
        return response;
      }
    });
  } else {
    return mapper.responseMapping(usrConst.CODE.BadRequest, "Invalid details");
  }
}

async function getAllUserTopups(details) {
  if (details.emailId && details.apiKey) {
    return await validateRequest(details).then(async (response) => {
      if (response == true) {
        const query = {
          merchantEmailId: details.emailId,
        };

        let merchant_topup_data = await TopupTransactions.aggregate([
          { $match: query }, // Optionally, you can filter the data before projecting
          {
              $project: {
                  grossAmount: "$grossAmount",
                  FeesPercentage: "$deductedFeesPercentage",
                  usdtRate: "$currencyRate",
                  remark: "$remark",
                  status: "$status",
                  payoutBalance: "$payoutBalance",
                  netFees: "$deductedFees",
                  usdtNet: "$currencyNetCharge",
                  transaction_date: { $toDate: "$transaction_date" }
                  // Add more fields with new names as needed
              }
          },
          { $sort: { transaction_date: -1 } }, // Sort by transaction_date field in ascending order
          { $skip: details?.skip || 0 }, // Skip the specified number of documents
          { $limit: details?.limit || 10 } ,// Limit the result to the specified number of documents
      ]).exec();

       // Pipeline to count total documents
const countPipeline = [
  { $match: query }, // Match the documents based on the query
  // Optionally, you can add more stages here if needed
  { $count: "totalCount" } // Count the total number of documents
];

// Execute the aggregation pipeline to count total documents
const totalCountResult = await TopupTransactions.aggregate(countPipeline).exec();
const totalCount = totalCountResult.length > 0 ? totalCountResult[0].totalCount : 0;

let txStart = totalCount -details.skip;
       for(let i=0;i<merchant_topup_data.length;i++){
        merchant_topup_data[i].txIndex = txStart -i;
       }
       if (response)
       return mapper.responseMappingWithData(
         usrConst.CODE.Success,
         usrConst.MESSAGE.Success,
         merchant_topup_data
       );
     else
       return mapper.responseMapping(
         usrConst.CODE.BadRequest,
         "Invalid details"
       );
      } else if (response == false) {
        return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
      } else {
        return response;
      }
    });
  } else {
    return mapper.responseMapping(usrConst.CODE.BadRequest, "Invalid details");
  }
}

async function getProfileData(details) {
  if (!details.emailId)
    return mapper.responseMapping(usrConst.CODE.BadRequest, "Invalid details");
  const query = {
    emailId: details.emailId,
  };
  const response = await dao.getAllTransactions(query);
  console.log(response);
  if (response) {
    const encrytedKey = appUtils.encryptText(response.apiKey);

    let ProfileData = response._doc || response; // Use _doc if available, otherwise use the response directly

    ProfileData.apiKey = encrytedKey;

    // Check existence before deleting
    if (ProfileData.hasOwnProperty("payoutGateway")) {
      delete ProfileData.payoutGateway;
    }

    if (ProfileData.hasOwnProperty("premiumGateway")) {
      delete ProfileData.premiumGateway;
    }

    if (ProfileData.hasOwnProperty("settlements")) {
      delete ProfileData.settlements;
    }

    if (ProfileData.hasOwnProperty("payouts")) {
      delete ProfileData.payouts;
    }

    if (ProfileData.hasOwnProperty("platformFee")) {
      delete ProfileData.platformFee;
    }
    if (ProfileData.hasOwnProperty("transactions")) {
      delete ProfileData.transactions;
    }
    if (ProfileData.hasOwnProperty("gateway")) {
      delete ProfileData.gateway;
    }
    // Now ProfileData should contain the modified data without Mongoose metadata

    return mapper.responseMappingWithData(
      usrConst.CODE.Success,
      usrConst.MESSAGE.Success,
      ProfileData
    );
  } else
    return mapper.responseMapping(usrConst.CODE.BadRequest, "Invalid details");
}

async function getEncryptionKey(details) {
  if (!details.emailId)
    return mapper.responseMapping(usrConst.CODE.BadRequest, "Invalid details");
  if (details.emailId && details.apiKey) {
    return await validateRequest(details).then(async (response) => {
      if (response == true) {
        const query = {
          emailId: details.emailId,
        };
        const response = await dao.getAllTransactions(query);
        console.log(response);
        if (response) {
          const encryptedKey = response.encryptionKey; //appUtils.encryptText(response.apiKey)

          return mapper.responseMappingWithData(
            usrConst.CODE.Success,
            usrConst.MESSAGE.Success,
            encryptedKey
          );
        } else
          return mapper.responseMapping(
            usrConst.CODE.BadRequest,
            "Invalid details"
          );
      } else if (response == false) {
        return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
      } else {
        return response;
      }
    });
  }
}
async function getAllUsersTransactions(details) {
  if (details.email_Id && details.apiKey) {
    return await validateAdminRequest(details).then(async (response) => {
      if (response == true) {
        const response = await dao.getAllUsersTransactions();
        console.log(response);
        return mapper.responseMappingWithData(
          usrConst.CODE.Success,
          usrConst.MESSAGE.Success,
          response
        );
      } else if (response == false) {
        return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
      } else {
        return response;
      }
    });
  } else {
    return mapper.responseMapping(usrConst.CODE.BadRequest, "Invalid details");
  }
}

async function getBazorpayPaymentStatus(details) {
  const response = await fetchBazorpayPaymentStatus(details);
  //console.log(JSON.parse(response.message))
  const validJsonString = response.message.replace(/'/g, '"');

  // Parse the JSON string into a JavaScript object
  const jsonObject = JSON.parse(validJsonString);
  if (jsonObject.statusCode == 200) {
    return mapper.responseMappingWithData(
      usrConst.CODE.Success,
      usrConst.MESSAGE.Success,
      jsonObject.data[0]
    );
  } else {
    return mapper.responseMappingWithData(
      usrConst.CODE.Success,
      usrConst.MESSAGE.Success,
      jsonObject
    );
  }
}

async function getPayinStatus(details) {
  console.log(details);
  return validateRequest(details).then(async (response) => {
    if (response == true) {
      const response = await fetchPayintStatusBz(details);
      //console.log(JSON.parse(response.message))
      // const validJsonString = response.message.replace(/'/g, "\"");

      // // Parse the JSON string into a JavaScript object
      // const jsonObject = JSON.parse(validJsonString);
      if (response.transaction) {
        return mapper.responseMappingWithData(
          usrConst.CODE.Success,
          usrConst.MESSAGE.Success,
          response.transaction
        );
      } else {
        return mapper.responseMappingWithData(
          usrConst.CODE.DataNotFound,
          usrConst.MESSAGE.InvalidDetails,
          "transaction not found"
        );
      }
    } else if (response == false) {
      return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
    } else {
      return response;
    }
  });
}

async function fetchPayinStatus(details) {
  console.log(details);
  return validateRequest(details).then(async (response) => {
    if (response == true) {
      let query = {
        emailId: details.emailId,
      };
      if(!details?.transaction_id) 
      {
        return mapper.responseMappingWithData(
          usrConst.CODE.BadRequest,
          usrConst.MESSAGE.InvalidDetails,
           "Please enter transaction id" 
        );    
        }
        // if(!details?.transaction_date) 
        // {
        //   return mapper.responseMappingWithData(
        //     usrConst.CODE.BadRequest,
        //     usrConst.MESSAGE.InvalidDetails,
        //      "Please enter transaction date" 
        //   );    
        //   }
      const txType = await dao.fetchTxDetail(query, details.transaction_id);
      if (txType) {
        console.log(txType);
        if (txType.hash == "xyzbazorpay") {
          const response = await fetchPayintStatusBz(details);
          console.log("bazarpay", response);
          if (response.transaction.amount) {
            const respObject = {
              amount: response.transaction.amount,
              transaction_id: response.transaction.merchant_transaction_id,
              status: response.transaction.status,
            };
            return mapper.responseMappingWithData(
              usrConst.CODE.Success,
              usrConst.MESSAGE.Success,
              respObject
            );
          } else {
            return mapper.responseMappingWithData(
              usrConst.CODE.Success,
              usrConst.MESSAGE.Success,
              { status: "transaction not found" }
            );
          }
        }
       
        const respObject = {
          amount: txType.amount,
          transaction_id: txType.transaction_id || txType.transactionId,
          status: txType.status === "IN-PROCESS" ? "pending" :
                  txType.status === "fail" || txType.status === "failed" ? "failed" :
                  txType.status === "expired" ? "expired" :
                  txType.status,
          code: txType.status === "success" ? "00" :
                txType.status === "IN-PROCESS" ? "01" :
                txType.status === "failed" || txType.status === "fail" ? "02" :
                txType.status === "expired" ? "U69" : "03",
          description: txType.status === "success" ? "transaction success" :
                       txType.status === "IN-PROCESS" ? "transaction pending" :
                       txType.status === "failed" || txType.status === "fail" ? "Customer failed to complete transaction" :
                       txType.status === "expired" ? "Collect request expired" :
                       "Not found"
        };
        console.log('resp object',respObject)
        if (txType) {
          return mapper.responseMappingWithData(
            usrConst.CODE.Success,
            usrConst.MESSAGE.Success,
            respObject
          );
        } else {
          return mapper.responseMappingWithData(
            usrConst.CODE.DataNotFound,
            usrConst.MESSAGE.InvalidDetails,
            { status: "transaction not found" }
          );
        }
      } else {
        return mapper.responseMappingWithData(
          usrConst.CODE.DataNotFound,
          usrConst.MESSAGE.InvalidDetails,
          { status: "transaction not found" }
        );
      }
    } else if (response == false) {
      return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
    } else {
      return response;
    }
  });
}

async function getPinwalletPayinStatus(details) {
  console.log(details);
  let query = {
    emailId: details.emailId,
  };
  return dao.fetchTxDetail(query, details.transactionId).then((response) => {
    console.log(response);
    return response;
  });
}

async function getVolumes(details) {
  if (details.emailId && details.apiKey) {
    return await validateRequest(details).then(async (response) => {
      if (response == true) {
        const query = {
          emailId: details.emailId,
        };
        const response = await dao.getAllUserTransactions(query);
        // const successfulTransactions = response.transactions.filter(transaction => transaction.status === 'success');
        // function isYesterday(dateString) {
        //     const transactionDate = moment.tz(dateString, 'Asia/Kolkata'); // Convert to Indian Standard Time (IST)
        //     const yesterday = moment.tz('Asia/Kolkata').subtract(1, 'days').startOf('day'); // Start of yesterday in IST
        //     const today = moment.tz('Asia/Kolkata').startOf('day'); // Start of today in IST

        //     return transactionDate >= yesterday && transactionDate < today;// Compare within the same day
        //   }

        //   // Function to check if a date is today
        //   function isToday(dateString) {
        //     const transactionDate = moment.tz(dateString, 'Asia/Kolkata'); // Convert to Indian Standard Time (IST)
        //     const today = moment.tz('Asia/Kolkata'); // Get the current time in IST

        //     return transactionDate.isSame(today, 'day');

        // }

        //   // Function to check if a date is within the last 7 days (weekly)
        //   function isWithinLastWeek(dateString) {
        //     const date = new Date(dateString);
        //     const oneWeekAgo = new Date();
        //     oneWeekAgo.setUTCHours(0, 0, 0, 0);
        //     oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        //     return date >= oneWeekAgo && date < new Date(); // Compare within the same day
        //   }
        //   // Get the current date in the same format as the 'transaction_date'
        //   const currentDate = new Date().toISOString();

        //   // Initialize arrays for yesterday, today, and weekly transactions
        //   const yesterdayTransactions = [];
        //   const todayTransactions = [];
        //   const weeklyTransactions = [];

        //   // Iterate through successful transactions
        //   for (const transaction of successfulTransactions) {
        //     const transactionDate = new Date(transaction.transaction_date);

        //     if (isToday(transactionDate)) {
        //         todayTransactions.push(transaction);
        //     }
        //      if (isYesterday(transactionDate)) {
        //         yesterdayTransactions.push(transaction);
        //     }
        //     if (isWithinLastWeek(transactionDate)) {
        //         weeklyTransactions.push(transaction);
        //     }
        // }

        //   // Now, you have three arrays: yesterdayTransactions, todayTransactions, and weeklyTransactions
        // //   console.log("Yesterday's Transactions:", yesterdayTransactions);
        // //   console.log("Today's Transactions:", todayTransactions);
        // //   console.log("Weekly Transactions:", weeklyTransactions);

        // function calculateTotalAmount(transactions) {
        //     return transactions.reduce((total, transaction) => total + transaction.amount, 0);
        //   }

        //   // Calculate the total amount for yesterday, today, and weekly transactions
        //   const totalAmountYesterday = calculateTotalAmount(yesterdayTransactions);
        //   const totalAmountToday = calculateTotalAmount(todayTransactions);
        //   const totalAmountWeekly = calculateTotalAmount(weeklyTransactions);

        //   // Create objects with the desired structure
        //   const yesterdayObject = { volume: totalAmountYesterday, transactions: yesterdayTransactions };
        //   const todayObject = { volume: totalAmountToday, transactions: todayTransactions };
        //   const weeklyObject = { volume: totalAmountWeekly, transactions: weeklyTransactions };

        //   // Now you have the three objects with the specified structure
        // //   console.log("Yesterday's Object:", yesterdayObject);
        // //   console.log("Today's Object:", todayObject);
        // //   console.log("Weekly Object:", weeklyObject);
        const totalTransactions = response.totalTransactions;
        const SuccessfulTransactions = response.successfulTransactions;
        const successRate =
          Number(response.last24hrSuccess) > 0 ||
          Number(response.last24hrTotal) > 0
            ? (Number(response.last24hrSuccess) /
                Number(response.last24hrTotal)) *
              100
            : 0;
        let responseData = {
          yesterdayObject: { volume: response.yesterday },
          todayObject: { volume: response.last24hr },
          weeklyObject: { volume: response.balance },
          totalTransactions,
          successfulTransactions: response.last24hr,
          successRate,
          balance: response.balance,
        };
        console.log(responseData);
        if (responseData)
          return mapper.responseMappingWithData(
            usrConst.CODE.Success,
            usrConst.MESSAGE.Success,
            responseData
          );
        else
          return mapper.responseMapping(
            usrConst.CODE.BadRequest,
            "Invalid details"
          );
      } else if (response == false) {
        return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
      } else {
        return response;
      }
    });
  } else {
    return mapper.responseMapping(usrConst.CODE.BadRequest, "Invalid details");
  }
}

async function getDataByUtr(details) {
  return validateRequest(details).then((response) => {
    if (response == true) {
      const query = {
        emailId: details.emailId,
      };

      return dao.getDataByUtr(details)
      .then((response)=>{
        if(response)
        {

          return mapper.responseMappingWithData(
            usrConst.CODE.Success,
            usrConst.MESSAGE.Success,
            response
            );
          } else {
            console.log("Failed to update ");
            return mapper.responseMapping(
              usrConst.CODE.INTRNLSRVR,
              usrConst.MESSAGE.internalServerError
            );
          }
          
      })
    
    } else if (response == false) {
      return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
    } else {
      return mapper.responseMapping(usrConst.CODE.BadRequest, response);
    }
  });
}

async function getTransactionsUser(details) {
  return validateRequest(details).then((response) => {
    if (response == true) {
      const query = {
        emailId: details.emailId,
        skip: details.skip,
        limit: details.limit,
      };

      return dao.getUserTransactionsData(query).then((user) => {
        if (user) {
          //console.log("success", user);

          return mapper.responseMappingWithData(
            usrConst.CODE.Success,
            usrConst.MESSAGE.Success,
            user
          );
        } else {
          console.log("Failed to update ");
          return mapper.responseMapping(
            usrConst.CODE.INTRNLSRVR,
            usrConst.MESSAGE.internalServerError
          );
        }
      });
    } else if (response == false) {
      return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
    } else {
      return mapper.responseMapping(usrConst.CODE.BadRequest, response);
    }
  });
}

async function getTransactionsByDate(details) {
  return validateRequest(details).then((response) => {
    if (response == true) {
      const query = {
        emailId: details.emailId,
      };

      return dao
        .getTransactionByDate(query, details.start_date, details.end_date)
        .then((user) => {
          if (user) {
            //console.log("success", user);

            return mapper.responseMappingWithData(
              usrConst.CODE.Success,
              usrConst.MESSAGE.Success,
              user
            );
          } else {
            console.log("Failed to get data");
            return mapper.responseMapping(
              usrConst.CODE.INTRNLSRVR,
              usrConst.MESSAGE.internalServerError
            );
          }
        });
    } else if (response == false) {
      return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
    } else {
      return mapper.responseMapping(usrConst.CODE.BadRequest, response);
    }
  });
}

async function getAllTransactionWithSuccessStatus(details) {
  return validateRequest(details).then((response) => {
    if (response == true) {
      const query = {
        emailId: details.emailId,
      };

      return dao
        .getAllTransactionWithSuccessStatus(query, details)
        .then((user) => {
          if (user) {
            //console.log("success", user);

            return mapper.responseMappingWithData(
              usrConst.CODE.Success,
              usrConst.MESSAGE.Success,
              user
            );
          } else {
            console.log("Failed to get data");
            return mapper.responseMapping(
              usrConst.CODE.INTRNLSRVR,
              usrConst.MESSAGE.internalServerError
            );
          }
        });
    } else if (response == false) {
      return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
    } else {
      return mapper.responseMapping(usrConst.CODE.BadRequest, response);
    }
  });
}

async function getTransactionsByStatus(details) {
  return validateRequest(details).then((response) => {
    if (response == true) {
      const query = {
        emailId: details.emailId,
        status: details.status,
        limit: details.limit,
        skip: details.skip,
      };

      return dao.getTransactionsByStatus(query).then((user) => {
        if (user) {
          //console.log("success", user);

          return mapper.responseMappingWithData(
            usrConst.CODE.Success,
            usrConst.MESSAGE.Success,
            user
          );
        } else {
          console.log("Failed to get data");
          return mapper.responseMapping(
            usrConst.CODE.INTRNLSRVR,
            usrConst.MESSAGE.internalServerError
          );
        }
      });
    } else if (response == false) {
      return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
    } else {
      return mapper.responseMapping(usrConst.CODE.BadRequest, response);
    }
  });
}

async function getTransactionsByStatusAndDate(details) {
  return validateRequest(details).then((response) => {
    if (response == true) {
      const query = {
        emailId: details.emailId,
        status: details.status,
        startDate:details?.start_date,
        endDate:details?.end_date,
        limit: details.limit,
        skip: details.skip,
      };

      return dao.getTransactionsByStatusAndDate(query).then((user) => {
        if (user) {
          //console.log("success", user);

          return mapper.responseMappingWithData(
            usrConst.CODE.Success,
            usrConst.MESSAGE.Success,
            user
          );
        } else {
          console.log("Failed to get data");
          return mapper.responseMapping(
            usrConst.CODE.INTRNLSRVR,
            usrConst.MESSAGE.internalServerError
          );
        }
      });
    } else if (response == false) {
      return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
    } else {
      return mapper.responseMapping(usrConst.CODE.BadRequest, response);
    }
  });
}

async function updatePayoutCallbackUrl(details) {
  return validateRequest(details).then((response) => {
    if (response == true) {
      const query = {
        emailId: details.emailId,
      };
      let updateDetails = {
        payoutCallbackUrl: details.payoutCallbackUrl,
      };

      return dao.updateProfile(query, updateDetails).then((userUpdated) => {
        if (userUpdated) {
          //console.log('success', userUpdated)

          return mapper.responseMappingWithData(
            usrConst.CODE.Success,
            usrConst.MESSAGE.Success,
            "success"
          );
        } else {
          console.log("Failed to update ");
          return mapper.responseMapping(
            usrConst.CODE.INTRNLSRVR,
            usrConst.MESSAGE.internalServerError
          );
        }
      });
    } else if (response == false) {
      return mapper.responseMapping(usrConst.CODE.FRBDN, "Invalid apiKey");
    } else {
      return mapper.responseMapping(usrConst.CODE.BadRequest, response);
    }
  });
}

module.exports = {
  register,

  login,

  forgotPassword,

  setNewPassword,

  confirmOtp,

  sendPaymentRequest,

  getAllUserTransactions,

  sendPayinRequest,

  resetPassword,

  getAllUsersTransactions,

  getBazorpayPaymentStatus,

  updateProfile,

  updateTransaction,

  getProfileData,

  getPayinStatus,

  getPinwalletPayinStatus,

  updateCallbackUrl,

  updateRedirectUrl,

  sendPayinRequestIntent,

  getVolumes,

  getDataByUtr,

  getTransactionsUser,

  getTransactionsByDate,

  getTransactionsByStatus,

  fetchPayinStatus,

  getEncryptionKey,

  getAllUserSettlements,

  getAllTransactionWithSuccessStatus,

  sendPayinRequestCollect,

  validateRequest,

  sendPayinRequestPage,

  getTransactionsByStatusAndDate,

  updatePayoutCallbackUrl,

  getAllUserTopups
};

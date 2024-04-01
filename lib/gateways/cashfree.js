const fetch = require("node-fetch")
const { PayoutTransaction } = require("../generic/models/TransactionData")
async function cashfreepayouttest() {
  try {

    const url = 'https://payout-gamma.cashfree.com/payout/v1/authorize'; // PLease change the user according to production -:https://payout-api.cashfree.com/payout/v1/authorize
    const authorization_options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'x-client-id': process.env.CF_CLIENT_ID,
        'x-client-secret': process.env.CF_CLIENT_SECRET
      }
    };
    const authorization_response = await fetch(url, authorization_options)
    if (!authorization_response.ok) {
      throw new Error(`HTTP error! Status: ${authorization_response.status}`);
    }
    const authorization_data = await authorization_response.json();
    console.log(authorization_data)

    const token = "Bearer " + authorization_data.data.token
    console.log("this is token", token)
    const postData = {
      amount: 30,  //Please paste here dynamic amount 
      transferId: "JUN78B287PQ755789999", //please provide here dynamic transfer id and it will be always unique
      transferMode: "upi",  //please provide here the transfermode
      beneDetails: {
        beneId: "898989899899",
        name: "Vivek",  // please provide here the beneficiary details correctly
        email: "test@gmail.com",
        phone: "7054874357",
        vpa: "success@upi",
        address1: "LKO",
        city: "LKO",
        state: "UP",
        pincode: "222160",
        beneId: "898989899899"
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(postData)
    };


    const response = await fetch("https://payout-gamma.cashfree.com/payout/v1.2/directTransfer", options);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log('POST request successful:', data);
   
  } catch (err) {
    console.log(err)
  }

}
async function cashfreePayout(details,dao,mapper,userData,usrConst,gateway) {
  try {
    const url = 'https://payout-gamma.cashfree.com/payout/v1/authorize'; // PLease change the user according to production -:https://payout-api.cashfree.com/payout/v1/authorize
    const authorization_options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'x-client-id': process.env.CF_CLIENT_ID,
        'x-client-secret': process.env.CF_CLIENT_SECRET
      }
    };
    const authorization_response = await fetch(url, authorization_options)
    if (!authorization_response.ok) {
      throw new Error(`HTTP error! Status: ${authorization_response.status}`);
    }
    const authorization_data = await authorization_response.json();
    console.log(authorization_data)

    const token = "Bearer " + authorization_data.data.token
    console.log("this is token", token)
    const referenceId = Math.floor(Math.random() * 10000000000000);
    const postData = {
      amount: details?.amount,  //Please paste here dynamic amount 
      transferId: referenceId, //please provide here dynamic transfer id and it will be always unique
      transferMode: "upi",  //please provide here the transfermode
      beneDetails: {
        name: details?.account_name,  // please provide here the beneficiary details correctly
        email: details?.customer_email,
        phone: details?.customer_phone,
        vpa: details?.customer_upiId, // vpa should always be in capital and according to user details make it dynamic
        address1: details?.customer_address //provide any related address
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(postData)
    };


    const response = await fetch("https://payout-gamma.cashfree.com/payout/v1/directTransfer", options);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log('POST request successful:', data);
    if (data?.status=="SUCCESS") {
      const timeElapsed = Date.now();
      const today = new Date(timeElapsed);
      const updateDetails = {
        uuid: userData._id,
        transactionId: referenceId,
        merchant_ref_no: data?.data?.referenceId,
        amount: details?.amount,
        currency: "inr",
        country: "india",
        status: "pending",
        transaction_type: "payout",
        transaction_date: today.toISOString(),
        gateway: gateway,
        phone: details?.phone,
        customer_name: details?.customer_name,
        upiId: details?.upiId,
        account_number: details?.account_number,
        account_name: details?.account_name,
        ifsc_code: details?.bank_ifsc,
        bank_name: details?.bank_name,
        customer_email: details?.customer_email,
        business_name: userData.business_name,
        payoutAmount: details?.amount,
        comission: 0,
        utr:data?.data?.utr
      };
     const updated = await dao.createTransaction(updateDetails);
     //console.log(updated)
      if (updated) {
        return mapper.responseMappingWithData(
          usrConst.CODE.Success,
          usrConst.MESSAGE.Success,
          {message:"Payment request submitted",transaction_id:referenceId}
        );
      } else {
        return mapper.responseMappingWithData(
          usrConst.CODE.INTRNLSRVR,
          usrConst.MESSAGE.TransactionFailure,
          "Unable to process transaction at the moment"
        );
      }
    }else {
      return mapper.responseMappingWithData(
        usrConst.CODE.INTRNLSRVR,
        usrConst.MESSAGE.TransactionFailure,
        "Unable to process transaction at the moment"
      );
    }
  } catch (err) {
    console.log(err)
  }

}

async function generateCashfreePayinOrder()
{
  const referenceId = Math.floor(Math.random() * 10000000000000);
  const data = {
    customer_details: {
      customer_id: '7112AAA8122344',
      customer_phone: '9898989898'
    },
    order_meta: {
      return_url: 'https://example.com?order_id=playstation_purchase_4',
      payment_methods: 'cc,dc,upi'
    },
    order_id: `${referenceId}`,
    order_currency: 'INR',
    order_amount: 10.34
  };
  
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'x-api-version': '2023-08-01',
    'x-client-id': 'TEST1013866779476a70d5d5984770d276683101',
    'x-client-secret': 'cfsk_ma_test_72f4c7372c027b905bb74051a8ff1c96_699a9159'
  };
  
  const response = await fetch('https://sandbox.cashfree.com/pg/orders', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data)
  })
  const responseJson = await response.json()
  return responseJson
}

async function cahsfreePayin()
{
  
 
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'x-api-version': '2023-08-01',
    'x-client-id': 'TEST1013866779476a70d5d5984770d276683101',
    'x-client-secret': 'cfsk_ma_test_72f4c7372c027b905bb74051a8ff1c96_699a9159'
  };
  
  
  const responseJson = await generateCashfreePayinOrder()
  
  console.log(responseJson)
  const data = {
    payment_session_id: responseJson.payment_session_id,
    payment_method: {
      upi: { channel: 'link',
    },

    },
   

  };
  
  
  fetch('https://sandbox.cashfree.com/pg/orders/sessions', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data)
  })
  .then(response => {
    // console.log(response)
    // if (!response.ok) {
    //   throw new Error('Network response was not ok');
    // }
    return response.json();
  })
  .then(jsonResponse => {
    console.log('resp',jsonResponse); // Handle the response data
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
}
//cahsfreePayin()

async function cashfreepayouttestbank() {
  try {
    const url = 'https://payout-gamma.cashfree.com/payout/v1/authorize'; // PLease change the user according to production -:https://payout-api.cashfree.com/payout/v1/authorize
    const authorization_options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'x-client-id': process.env.CF_CLIENT_ID,
        'x-client-secret': process.env.CF_CLIENT_SECRET
      }
    };
    const authorization_response = await fetch(url, authorization_options)
    if (!authorization_response.ok) {
      throw new Error(`HTTP error! Status: ${authorization_response.status}`);
    }
    const authorization_data = await authorization_response.json();
    console.log(authorization_data)

    const token = "Bearer " + authorization_data.data.token

    const postData = {
      amount: 1,  //Please paste here dynamic amount 
      transferId: 67896688989890, //please provide here dynamic transfer id and it will be always unique
      transferMode: "banktransfer",  //please provide here the transfermode
      beneDetails: {
        name: "Tushant chakravarty",  // please provide here the beneficiary details correctly
        email: "tushant029@gmail.com",
        phone: "+919340079982", // vpa should always be in capital and according to user details make it dynamic
        bankAccount: "026291800001191",
        address1: "Kasia kushinagar" //provide any related address
      }
    }
    const postData2 = {
      amount: 30,
      transferId: "JUN78B278705518176",
      transferMode: "banktransfer",
      remarks: "test",
      beneDetails: {
        bankAccount: "0266291800001191",
        ifsc: "YESB0000262",
        name: "john doe",
        email: "test@gmail.com",
        phone: "9988775566",
        address1: "LKO",
        city: "LKO",
        state: "UP",
        pincode: "222160",
        beneId: "898989899899"
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(postData2)
    };


    const response = await fetch("https://payout-gamma.cashfree.com/payout/v1/directTransfer", options);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log('POST request successful:', data);
  } catch (err) {
    console.log(err)
  }

}

module.exports = {
  cashfreepayouttest,
  cashfreePayout,
  cahsfreePayin,
  cashfreepayouttestbank
}
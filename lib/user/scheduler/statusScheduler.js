const { encryptParameters } = require("../../appUtils");
const { getAllPendinTransactionsPaythrough, fetchPaythroughStatus } = require("../../gateways/paythrough");
const { updateTransactionStatus } = require("../transactionDao");
const { getUserDetails } = require("../userDao");
const ObjectId = require("mongoose").Types.ObjectId;

async function updatePendingTransactionStatus()
{
    try{

        const paythrough = await getAllPendinTransactionsPaythrough()
        console.log(paythrough.length)
        if(paythrough)
        {
            paythrough.map(async (item,index)=>{
                // let query = {
                //     _id:ObjectId(item?.uuid)
                // }
                // const user = await getUserDetails(query)
                // console.log('user',user?.callbackUrl)
                if(item&&index<100)
                {

                    const response = await fetchPaythroughStatus(item)
                    .catch((e)=>{
                        console.log(e)
                    })
                    if(response&&(response?.current_status=='success'||response?.current_status=="failed"))
                    {
                        const updateDetails ={
                            status:response.current_status
                        }
                        console.log('update obj',updateDetails,index)
                        // let callBackDetails = {
                        //     transaction_id: item.transactionId,
                        //     status: response?.current_status=='success', //details.TRANSACTIONPAYMENTSTATUS,
                        //     amount: item.amount,
                        //     utr: "",
                        //     phone: item.phone,
                        //     username: item.username,
                        //     upiId: item.upiId,
                        //     date: item.transaction_date,
                        //   };
                        // console.log(callBackDetails)
                        updateTransactionStatus(item?.transactionId,updateDetails)
                    }
                }
            })
        }
    }catch(error)
    {
        console.log(error)
    }
    
}
module.exports={
    updatePendingTransactionStatus
}
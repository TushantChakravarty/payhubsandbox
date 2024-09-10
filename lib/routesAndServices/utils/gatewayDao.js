const mongoose = require('mongoose')
let BaseDao = require('../../dao/BaseDao')

const constants = require('../../constants')

const GatewayData = require('../../generic/models/gatewayData'); // Import your GatewayData model
const Admin = require('../../generic/models/adminModel')
const user =  require('../../generic/models/userModel')
const adminDao = new BaseDao(Admin);
const usrDao = new BaseDao(user)
const ObjectId = require('mongoose').Types.ObjectId;


/*#################################            Load modules end            ########################################### */


/**
 * Get user details
 * @param {Object} query query to find user details
 */
function getUserDetails(query) {
    

    return adminDao.findOne(query)
}

// Function to push data into the date array
async function pushDataForToday(newData) {
    try {
        const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }).slice(0, 10);

        const result = await GatewayData.findOneAndUpdate(
            {
                _id: ObjectId('6547ebf90f9ec135f4277250'),
                'gatewayData.date': currentDate,
            },
            {
                $push: {
                    'gatewayData.$.data': newData,
                },
            },
            {
                new: true, // Return the modified document
            }
        );
        const [existingDocument] = await Promise.all([result])

        if (!existingDocument) {
            // If the document for the current date doesn't exist, create a new one
            const newResult = await GatewayData.findOneAndUpdate(
                { _id: ObjectId('6547ebf90f9ec135f4277250') },
                {
                    $addToSet: {
                        'gatewayData': {
                            date: currentDate,
                            data: [newData],
                        },
                    },
                },
                {
                    new: true, // Return the modified document
                }
            );

            console.log('Data pushed for the current day:', newResult);
        } else {
            console.log('Data pushed for the current day:', result);
        }

    } catch (error) {
        console.error('Error pushing data for the current day:', error);
    }
}
async function fetchDataForCurrentDate() {
    try {
        // Get the current date in the format "YYYY-MM-DD"
        const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }).slice(0, 10);

        // Find a document for the current day
        const document = await GatewayData.findOne({ 'gatewayData.date': currentDate });

        if (document) {
            // Document for the current day found, you can access its data array
            const data = document.gatewayData.reverse()
          //  console.log('Data for the current day:', data);
            return data[0].data
        } else {
            console.log('No data found for the current day.');
        }
    } catch (error) {
        console.error('Error fetching data for the current day:', error);
    }
}



module.exports = {

 
    getUserDetails,

    pushDataForToday,

    fetchDataForCurrentDate


}
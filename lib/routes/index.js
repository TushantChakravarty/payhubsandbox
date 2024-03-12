// Load user routes
const usrRouter = require('../user/userRoute')
const adminRouter = require('../user/adminRoute')
const reportsRouter = require('../user/reportsRoute')
const supportRouter = require('../support/supportRoutes')
const callbackRouter = require('../user/callbacks/callbackRoutes')
const payoutsRouter = require('../user/payouts/payoutRoutes')
const userPayoutsRouter = require('../user/payouts/userPayouts/userPayoutRoutes')
const salesRouter = require("../sales/salesRoute")

//========================== Load Modules End ==============================================

//========================== Export Module Start ====== ========================

module.exports = function (app) {
    app.get("/", (req, res) => {
        res.status(200).send("ok 1");
    })
    app.use('/user', usrRouter)
    app.use('/admin', adminRouter)
    app.use('/admin/reports', reportsRouter)
    app.use('/support', supportRouter)
    app.use('/callback', callbackRouter)
    app.use('/payouts', payoutsRouter)
    app.use('/sales', salesRouter)
    app.use('/user/payouts', userPayoutsRouter)

};

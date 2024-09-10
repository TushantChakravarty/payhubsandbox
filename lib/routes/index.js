// Load user routes
const usrRouter = require('../routesAndServices/user/userRoute')
const adminRouter = require('../routesAndServices/admin/adminRoute')
const reportsRouter = require('../routesAndServices/reports/reportsRoute')
const supportRouter = require('../routesAndServices/support/supportRoutes')
const callbackRouter = require('../routesAndServices/callbacks/callbackRoutes')
const payoutsRouter = require('../routesAndServices/payouts/payoutRoutes')
const userPayoutsRouter = require('../routesAndServices/payouts/userPayouts/userPayoutRoutes')
const salesRouter = require("../routesAndServices/sales/salesRoute")

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

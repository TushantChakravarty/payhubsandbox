const router = require("express").Router();
const facade = require('./salesFacade')


router.route('/login').post(async (req, res) => {
  try {
    await facade.Login(req, res)
  } catch (err) {
    res.send({
      responseCode: 500,
      responseCode: "Your request couldn't be processed please try again!"
    })
  }
})

router.route('/getVolumes').get(async (req, res) => {
  try {
    await facade.getVolumes(req, res)
  } catch (err) {
    res.send({
      responseCode: 500,
      responseCode: "Your request couldn't be processed please try again!"
    })
  }
})







module.exports = router

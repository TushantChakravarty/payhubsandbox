const service = require('./salesService')

async function Login(req, res) {
  try {
    return service.Login(req, res)
  } catch (err) {
    res.send({
      responseCode: 500,
      responseCode: "Your request couldn't be processed please try again!"
    })

  }
}

async function getVolumes(req, res) {
  try {
    return service.Login(req, res)
  } catch (err) {
    res.send({
      responseCode: 500,
      responseCode: "Your request couldn't be processed please try again!"
    })
  }

}

module.exports = {
  Login,
  getVolumes
}
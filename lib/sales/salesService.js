const appUtils = require("../appUtils")
const Sales = require("../generic/models/salesModel")
const jwtHandler = require("../jwtHandler")
async function Login(req, res) {
  try {
    const { emailId, password } = req.body

    if (emailId && emailId === "") {
      return res.send({
        responseCode: 403,
        responseMessage: "Please enter a valid Email"
      })
    }

    if (password && password === "") {
      return res.send({
        responseCode: 403,
        responseMessage: "Please enter a valid password"
      })
    }
    const sales = await Sales.findOne({ emailId: emailId }).select('+password');
    if (!sales) {
      return res.send({
        responseCode: 403,
        responseMessage: "Please enter a correct Email and Password"
      })
    }

    var isValidPassword = await appUtils.verifyPassword({ password: password }, sales);
    if (!isValidPassword) {
      return res.send({
        responseCode: 403,
        responseMessage: "Please enter a correct Email and Password"
      })
    }

    let token = await jwtHandler.genUsrToken({ _id: sales._id, email: sales.emailId, password: sales.password })

    sales.token = token
    await sales.save()

    return res.send({
      responseCode: 200,
      responseMessage: "Success",
      responseData: {
        emailId: sales.emailId,
        apiKey: sales.apiKey,
        token: sales.token
      }
    })


  } catch (err) {
    console.log(err)
    return res.send({
      responseCode: 500,
      responseMessage: "Your request couldn't be processed Please try agaiin!"
    })

  }
}

async function getVolumes(req, res) {
  try {


  } catch (err) {
    console.log(err)
    return res.send({
      responseCode: 500,
      responseMessage: "Your request couldn't be processed Please try agaiin!"
    })

  }
}




module.exports = {
  Login
}

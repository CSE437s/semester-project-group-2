// //https://www.w3schools.com/nodejs/nodejs_email.asp
require("dotenv").config()

const sendEmail = (email, link) => {
    const mailer = require("nodemailer")
    const sender = mailer.createTransport({
        service: 'gmail',
    auth: {
      user: process.env.GMAIL,
      pass: process.env.GMAIL_PASSWORD
    }
    })
    const mailingOptions = {
        from: process.env.GMAIL,
        to: email,
        subject: "Reset Your Password - WUSTL Office Hours",
        html: "<h1>Forgot your password?</h1><br>Reset your password at this <a href=\""+link+"\"> link</a>. If you did not request this link, you're toast."
    }
    return sender.sendMail(mailingOptions, (error, info) => {
        if(error) {
            console.log("Error while sending reset email:", error)
            return error
        }
        else {
            console.log("Email successfully sent", info)
            return info
        }
    })
}

module.exports = sendEmail
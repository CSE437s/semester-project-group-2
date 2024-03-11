//https://www.w3schools.com/nodejs/nodejs_email.asp
const mailer = require("nodemailer")
require("dotenv").config()

const sender = mailer.createTransport({
    service: "gmail",
    auth: {
        "email": process.env.GMAIL,
        "password": process.env.GMAIL_PASSWORD
    }
})

const sendEmail = (email, link) => {
    const mailingOptions = {
        from: process.env.GMAIL,
        to: email,
        subject: "Reset Your Password - WUSTL Office Hours",
        html: "<h1>Forgot your password?</h1><br>Reset your password at this <a href=\""+link+"\". If you did not request this link, you're toast."
    }
    sender.sendMail(mailingOptions, (error, info) => {
        if(error) {
            console.log("Error while sending reset email:", error)
        }
        else {
            console.log("Email successfully sent", info)
        }
    })
}


module.exports = sendEmail
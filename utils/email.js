const nodemailer = require("nodemailer");
const fs = require('fs');
const Hogan = require('hogan.js')
let template = fs.readFileSync("./views/email.hjs", "utf-8");
let compiledTemplate = Hogan.compile(template);

// async..await is not allowed in global scope, must use a wrapper
const sendEmail = async (options) => {

    let transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "4d2bc53c78e8fd",
            pass: "7faf6f4fc6fcb6"
        }
    });

    // let transporter = nodemailer.createTransport({
    //     host: process.env.SMTP_HOST,
    //     port: process.env.SMTP_PORT,
    //     auth: {
    //         user: process.env.SMTP_USERNAME,
    //         pass: process.env.SMTP_PASSWORD
    //     }
    // });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: process.env.SMTP_USERNAME, // sender address
        to: options.to,
        subject: options.subject,
        html: compiledTemplate.render(options.message),
    });

    // console.log("Message sent: %s", info.messageId);

    // Preview only available when sending through an Ethereal account
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return info;
}

module.exports = sendEmail;
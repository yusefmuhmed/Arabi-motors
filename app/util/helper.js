const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

class MyHelper {
  static resHandler = (res, statusCode, apiStatus, data, message) => {
    res.status(statusCode).send({
      apiStatus,
      data,
      message,
    });
  };

  static emailHandler = (mail) => {
    return new Promise((resolve, reject) => {
      const otp = otpGenerator.generate(4, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

      const transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com",
        port: 587,
        secure: false,
        auth: {
          user: "youssefmohamed3011@outlook.com",
          pass: "Photoshop30112556",
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const mailOptions = {
        from: "youssefmohamed3011@outlook.com",
        to: mail,
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is: ${otp}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          reject({
            apiStatus: false,
            data: null,
            message: "Error sending email",
          });
        } else {
          resolve({
            apiStatus: true,
            data: info.response,
            otp: otp,
          });
        }
      });
    });
  };

  static checkIsObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

}
module.exports = MyHelper;

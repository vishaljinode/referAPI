require('dotenv').config();
const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, message }) => {
  // Create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME, // Using environment variables
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // Setup email data
  let mailOptions = {
    from: '"Refer App" <vishaljinode@gmail.com>', 
    to: email, 
    subject: subject, 
    text: message, 
  
  };

  // Send mail with defined transport object
  let info = await transporter.sendMail(mailOptions);

  console.log('Message sent: %s', info.messageId); 
  
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  return info.accepted[0]

};

module.exports = sendEmail;

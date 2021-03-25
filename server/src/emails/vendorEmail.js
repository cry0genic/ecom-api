const sgMail = require("@sendgrid/mail");

const sendgridApiKey =
  "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";
sgMail.setApiKey(sendgridApiKey);

const sendWelcomeEmailtoVendor = (email, name) => {
  sgMail.send({
    to: email,
    from: "adityat1103@gmail.com",
    subject: "Welcome to the E-Commerce app",
    text: `Welcome to the app, ${name}. Start selling your products now!. `,
  });
};

const sendCancelationEmailtoVendor = (email, name) => {
  sgMail.send({
    to: email,
    from: "adityat1103@gmail.com",
    subject: "Sorry to see you go!",
    text: `Goodbye, ${name}. I hope to see you back sometime soon`,
  });
};

module.exports = {
  sendWelcomeEmailtoVendor,
  sendCancelationEmailtoVendor,
};

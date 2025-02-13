const sgMail = require("@sendgrid/mail");

const sendgridApiKey =
  "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";
sgMail.setApiKey(sendgridApiKey);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "adityat1103@gmail.com",
    subject: "Welcome to the E-Commerce App",
    text: `Welcome to the app, ${name}. Let me know how you get along with the app. `,
  });
};

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "adityat1103@gmail.com",
    subject: "Sorry to see you go!",
    text: `Goodbye, ${name}. I hope to see you back sometime soon`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
};

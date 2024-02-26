import Handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import { activationTemplate } from './emailTemplates/activation';
import { resetPasswordTemplate } from './emailTemplates/resetPassword';

export async function sendMail({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) {
  /*************** SETTING UP AN SMTP SERVER WITH A THIRD-PARTY SERVICE, MAILTRAP IN THIS CASE ******************/

  // We can set up Email testing using a fake smtp server to avoid spamming our receipient's inbox or Email sending using a real smtp server with MailTrap

  const { SMTP_USER, SMTP_PASSWORD, SMTP_EMAIL } = process.env;

  var transport = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });

  try {
    const sendResult = await transport.sendMail({
      from: SMTP_EMAIL,
      to,
      subject,
      html: body,
    });
    // console.log({ sendResult });
  } catch (error) {
    console.error(error);
  }

  /************************************  USING GMAIL SMTP SERVER  *********************************************************************/

  // TESTING IF OUR NODEMAILER IS CONNECTING TO OUR GMAIL SMTP SERVER

  // const { SMTP_EMAIL, SMTP_GMAIL_PASSWORD } = process.env;
  // const transport = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: SMTP_EMAIL,
  //     pass: SMTP_GMAIL_PASSWORD,
  //   },
  // });
  // try {
  //   const testResult = await transport.verify(); //to check if our nodemailer transport is connecting to our gmail smtp server without any error. It returns a value of true if there are no errors.
  //   // console.log('Test result of transport', testResult);
  // } catch (error) {
  //   console.error(error);
  // }

  // try {
  //   const sendResult = await transport.sendMail({
  //     from: SMTP_EMAIL,
  //     to,
  //     subject,
  //     html: body,
  //   });
  //   console.log({ sendResult });
  // } catch (error) {
  //   console.error(error);
  // }
}

// Beefree.io website offers free html templates for emails we can use for our email templates.

export function compileActivationTemplate(name: string, url: string) {
  const template = Handlebars.compile(activationTemplate);
  const htmlBody = template({
    name,
    url,
  });
  return htmlBody;
  // remember we specified 'name' and 'url' when customizing our website in Beefree.io using double curly braces.
  // That is, {{name}} and {{url}}. So this package automatically searches through our template and extracts it and replaces it with what we specified when calling the function.
  // This package also creates our body html template.
}

export function compileResetPasswordTemplate(name: string, url: string) {
  const template = Handlebars.compile(resetPasswordTemplate);
  const htmlBody = template({
    name,
    url,
  });
  return htmlBody;
  // remember we specified 'name' and 'url' when customizing our website in Beefree.io using double curly braces.
  // That is, {{name}} and {{url}}. So this package automatically searches through our template and extracts it and replaces it with what we specified when calling the function.
  // This package also creates our body html template.
}

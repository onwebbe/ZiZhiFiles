const nodemailer = require('nodemailer');
const logger = require('./Logger.js');
const MySQLCompanyZiZhi = require('./mysql/MySQLCompanyZiZhi');
const zizhiDB = new MySQLCompanyZiZhi();
// verify connection configuration

class Mailer {
  initEmail () {
    let self = this;
    return new Promise(async function(resolve, reject) {
      try {
        if (self.emailConfig == null) {
          self.emailConfig = await zizhiDB.queryConfig('utemail');
        }
        self.isInitializedSuccessfully = false;
        self.transporter = nodemailer.createTransport({
          host: self.emailConfig.server,
          port: self.emailConfig.port,
          secure: false, // true for 465, false for other ports
          auth: {
            user: self.emailConfig.username, // generated ethereal user
            pass: self.emailConfig.password // generated ethereal password
          }
        });
        self.transporter.verify(function(error, success) {
          if (error) {
            logger.error(error);
            reject(error);
          } else {
            logger.info('Server is ready to take our messages');
            self.isInitializedSuccessfully = true;
            resolve();
          }
        });
      } catch (e) {
        logger.error('Mailer:initEmail:Error ' + e);
      }
    });
  }
  async sendEmail(from, to, subject, content) {
    let self = this;
    await this.initEmail();
    return new Promise(async function(resolve, reject) {
      if (self.isInitializedSuccessfully === true) {
        let message = {
          from: from, // sender address
          to: to, // list of receivers
          subject: subject, // Subject line
          text: content, // plain text body
          html: content // html body
        };
        self.transporter.sendMail(message, (error, info) => {
          if (error) {
            logger.error(error);
            reject(error);
          }
          logger.info('Message sent: %s', info.messageId);
          // Preview only available when sending through an Ethereal account
          logger.info('Preview URL: %s', nodemailer.getTestMessageUrl(info));

          // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
          // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
          resolve();
        });
      }
    });
  }
}

exports.default = Mailer;
module.exports = exports.default;

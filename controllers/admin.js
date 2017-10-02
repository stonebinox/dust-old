const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const User = require('../models/User');

const transportOptions = {
  auth: {
    api_key: process.env.SENDGRID_API_KEY
  }
};

const transporter = nodemailer.createTransport(sgTransport(transportOptions));

const getUnverifiedUsers = () => {
  return new Promise((resolve, reject) => {
    User.find({
      $or: [{ verified: null }, { verified: false }]
    }).exec((err, users) => {
      if (err) {
        reject(err);
      }

      resolve(users);
    });
  });
};

exports.getAdmin = async (req, res) => {
  const users = await getUnverifiedUsers();

  res.render('admin', {
    title: 'Admin',
    fixedHeader: true,
    users
  });
};

exports.approveUser = async (req, res, next) => {
  User.findById(req.params.id, (err, user) => {
    if (err) { return next(err); }

    user.verified = true;

    user.save((err) => {
      if (err) {
        req.flash('errors', { msg: 'Couldnt activate user. Are you sure that user id exists?' });
        return res.redirect('/admin');
      }

      const mailOptions = {
        to: user.email,
        from: 'dust@dusthq.com',
        subject: 'Your Dust Account has been approved',
        text: 'Hello,\n\nThis is just a confirmation that your DustHQ account has just been approved.\n'
      };

      transporter.sendMail(mailOptions)
        .then(() => {
          req.flash('success', { msg: `User ${req.params.id} activated.` });
          res.redirect('/admin');
        }).catch(() => {
          req.flash('error', { msg: `User ${req.params.id} activated but couldnt send email.` });
          res.redirect('/admin');
        });
    });
  });
};

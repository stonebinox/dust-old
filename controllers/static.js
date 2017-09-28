const geoip = require('geoip-lite');
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

const transportOptions = {
  auth: {
    api_key: process.env.SENDGRID_API_KEY
  }
};

const transporter = nodemailer.createTransport(sgTransport(transportOptions));

exports.index = (req, res) => {
  const ip = req.clientIp;
  const lookup = geoip.lookup(ip);

  res.render('home', {
    fixedHeader: true,
    location: lookup && lookup.ll ? lookup.ll : [52.3637099, 4.8810739]
  });
};

exports.missingPage = (req, res) => {
  res.render('404', {
    title: '404'
  });
};

exports.about = (req, res) => {
  res.render('about', {
    title: 'About',
    animateNavbar: true
  });
};

exports.terms = (req, res) => {
  res.render('terms', {
    title: 'Terms and Conditions',
    fixedHeader: true
  });
};

exports.contact = (req, res) => {
  res.render('contact', {
    title: 'Contact',
    fixedHeader: true
  });
};

exports.postContact = (req, res) => {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('body', 'Message cannot be blank').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/contact');
  }

  const mailOptions = {
    to: 'rivasign@gmail.com',
    from: 'contact@dusthq.com',
    subject: `New message from: ${req.body.name}`,
    text: `Name= ${req.body.name}\n Email= ${req.body.email}\n\n ${req.body.body}`
  };

  return transporter.sendMail(mailOptions)
    .then(() => {
      req.flash('success', { msg: 'Thanks for your feedback, we will get back at you soon.' });
      res.redirect('/contact');
    })
    .catch(() => {
      req.flash('error', { msg: 'Couldnt post message, please try again later.' });
      res.redirect('/contact');
    });
};

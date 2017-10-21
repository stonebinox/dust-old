const _ = require('lodash');
const geoip = require('geoip-lite');

exports.index = (req, res) => {
  res.render('index', {
    title: 'Welcome',
    fixedHeader: true
  });
};

exports.home = (req, res) => {
  const ip = req.clientIp;
  const lookup = geoip.lookup(ip);

  res.render('home', {
    fixedHeader: true,
    isDeveloper: _.get(req, 'user.isDeveloper', false),
    // if default ip is localhost, just center it in amsterdam
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
    fixedHeader: true
  });
};

exports.terms = (req, res) => {
  res.render('terms', {
    title: 'Terms and Conditions',
    fixedHeader: true
  });
};

exports.featured_developers = (req, res) => {
  res.render('featured_developers', {
    title: 'Featured Developers',
    fixedHeader: true
  })
};

exports.mvps = (req, res) => {
  res.render('mvps', {
    title: 'MVPs',
    fixedHeader: true
  })
}
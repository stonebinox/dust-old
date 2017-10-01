const geoip = require('geoip-lite');

exports.index = (req, res) => {
  const ip = req.clientIp;
  const lookup = geoip.lookup(ip);

  res.render('home', {
    fixedHeader: true,
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
    animateNavbar: true
  });
};

exports.terms = (req, res) => {
  res.render('terms', {
    title: 'Terms and Conditions',
    fixedHeader: true
  });
};

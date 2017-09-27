exports.index = (req, res) => {
  res.render('home', {
    fixedHeader: true
  });
};

exports.missingPage = (req, res) => {
  res.render('404', {
    title: '404'
  });
};

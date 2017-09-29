const User = require('../models/User');

const getUnverifiedUsers = () => {
  return new Promise((resolve, reject) => {
    User.find({ $or: [{ verified: null }, { verified: false }] }).exec((err, users) => {
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

      req.flash('success', { msg: `User ${req.params.id} activated.` });
      res.redirect('/admin');
    });
  });
};

const adminList = [
  'ignacio@dusthq.com',
  'saad@dusthq.com',
  'walid@dusthq.com',
  'sammysgame.dev@gmail.com'
];

const isAdmin = (req, res, next) => {
  if (adminList.includes(req.user.email)) {
    next();
  } else {
    res.redirect('/');
  }
};

module.exports = {
  isAdmin,
  adminList
};

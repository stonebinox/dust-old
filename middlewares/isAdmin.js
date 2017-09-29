const adminList = [
  'asd@asd.com',
  'rivasign@gmail.com',
  'saad@dusthq.com',
  'walid@dusthq.com',
  's.sahawneh@gmail.com',
  'w.sahawneh@gmail.com'
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

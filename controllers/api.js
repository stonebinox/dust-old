const _ = require('lodash');
const User = require('../models/User');
const adminMiddleware = require('../middlewares/isAdmin');

const getSafeLL = (ll) => {
  try {
    return JSON.parse(ll);
  } catch (e) {
    return ['', ''];
  }
};

const serializeData = (users, current) => {
  return users.map((user) => {
    return {
      id: user._id.toString(),
      name: user.profile.name,
      location: getSafeLL(user.profile.locationLL),
      lastPrice: user.lastProject.price,
      lastDuration: user.lastProject.days,
      isAdmin: adminMiddleware.adminList.includes(user.email),
      isOwn: user._id.toString() === current.toString()
    };
  });
};

exports.getAllUsers = async (req, res) => {
  try {
    User.find({ verified: true }, (err, users) => {
      if (err) {
        throw new Error(err);
      }

      return res.status(200).json({ data: serializeData(users, _.get(req, 'user._id', '')) });
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ errors: ['Couldnt get collection'] });
  }
};

const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');
const hat = require('hat');

const userSchema = new mongoose.Schema({
  uid: String,
  email: { type: String, unique: true },
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  verified: { type: Boolean, default: false },
  isDeveloper: { type: Boolean, default: false },

  lastProject: {
    days: Number,
    price: Number
  },

  profile: {
    name: String,
    title: String,
    locationLL: String,
    locationPretty: String,
    introduction: String
  }
}, { timestamps: true });

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      user.uid = hat();
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;

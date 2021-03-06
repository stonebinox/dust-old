const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const passport = require('passport');
const User = require('../models/User');
const Project = require('../models/Project');
const MvpBuild = require('../models/MvpBuild');

const transportOptions = {
    auth: {
        api_key: process.env.SENDGRID_API_KEY
    }
};

const transporter = nodemailer.createTransport(sgTransport(transportOptions));

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }
    res.render('account/login', {
        title: 'Login',
        fullscreen: true
    });
};

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/log');
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) {
            req.flash('errors', info);
            return res.redirect('/log');
        }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            req.flash('success', { msg: 'Success! You are logged in.' });
            res.redirect('/');
        });
    })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
    req.logout();
    res.redirect('/');
};

/**
 * GET /signup
 * Signup page.
 */
exports.getSignup = (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }
    res.render('account/signup', {
        title: 'Create Account',
        fullscreen: true
    });
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/signup');
    }

    const user = new User({
        email: req.body.email,
        password: req.body.password,
        timezone: req.body.timezone
    });

    User.findOne({ email: req.body.email }, (err, existingUser) => {
        if (err) { return next(err); }
        if (existingUser) {
            req.flash('errors', { msg: 'Account with that email address already exists.' });
            return res.redirect('/signup');
        }
        user.save((err) => {
            if (err) { return next(err); }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                res.redirect('/?welcome=true');
            });
        });
    });
};

/**
 * GET /account
 * Profile page.
 */
exports.getSettings = (req, res) => {
    res.render('account/settings', {
        title: 'Settings',
        fixedHeader: true
    });
};

exports.postSetType = (req, res, next) => {
    const isDeveloper = req.body.isDeveloper;

    User.findById(req.user.id, (err, user) => {
        if (err) { next(err); }

        user.isDeveloper = isDeveloper;

        user.save((err) => {
            if (err) {
                next(err);
            }

            res.send(200);
        });
    });
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = (req, res, next) => {
    req.assert('email', 'Please enter a valid email address.').isEmail();
    req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        console.log(errors);
        req.flash('errors', errors);
        return res.redirect('/settings');
    }

    User.findById(req.user.id, (err, user) => {
        if (err) { return next(err); }
        user.email = req.body.email || '';
        user.profile.firstName = req.body.firstName || '';
        user.profile.lastName = req.body.lastName || '';
        user.profile.name = req.body.name || '';
        user.profile.title = req.body.title || '';
        user.profile.website = req.body.website || '';
        user.profile.producthunt = req.body.producthunt || '';
        user.profile.twitter = req.body.twitter || '';

        user.mvpSettings.days = req.body.daysToBuildMVP || '';
        user.mvpSettings.price = req.body.priceToBuildMVP || '';

        if (user.profile.locationPretty !== req.body.location) {
            user.profile.locationLL = req.body.locationLL || '';
            user.profile.locationPretty = req.body.locationPretty || '';
        }

        user.save((err) => {
            if (err) {
                if (err.code === 11000) {
                    req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
                    return res.redirect('/settings');
                }
                return next(err);
            }

            req.flash('success', { msg: 'Profile information has been updated.' });
            res.redirect('/settings');
        });
    });
};

exports.postUpdateProfileDeveloper = (req, res, next) => {
    req.assert('email', 'Please enter a valid email address.').isEmail();
    req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/settings');
    }

    User.findById(req.user.id, (err, user) => {
        if (err) { return next(err); }
        user.isDeveloper = true;
        user.email = req.body.email || '';

        user.profile.firstName = req.body.firstName || '';
        user.profile.lastName = req.body.lastName || '';
        user.profile.name = req.body.name || '';
        user.profile.title = req.body.title || '';
        user.profile.introduction = req.body.introduction || '';
        user.profile.website = req.body.website || '';
        user.profile.producthunt = req.body.producthunt || '';
        user.profile.twitter = req.body.twitter || '';

        user.mvpSettings.days = req.body.daysToBuildMVP || '';
        user.mvpSettings.price = req.body.priceToBuildMVP || '';

        if (user.profile.locationPretty !== req.body.location) {
            user.profile.locationLL = req.body.locationLL || '';
            user.profile.locationPretty = req.body.locationPretty || '';
        }

        user.save((err) => {
            if (err) {
                if (err.code === 11000) {
                    req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
                    return res.redirect('/settings');
                }
                return next(err);
            }

            req.flash('success', { msg: 'Profile information has been updated.' });
            res.redirect('/settings');
        });
    });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = (req, res, next) => {
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/settings');
    }

    User.findById(req.user.id, (err, user) => {
        if (err) { return next(err); }
        user.password = req.body.password;
        user.save((err) => {
            if (err) { return next(err); }
            req.flash('success', { msg: 'Password has been changed.' });
            res.redirect('/settings');
        });
    });
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = (req, res, next) => {
    User.remove({ _id: req.user.id }, (err) => {
        if (err) { return next(err); }

        req.logout();
        req.flash('info', { msg: 'Your account has been deleted.' });
        res.redirect('/');
    });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
exports.getOauthUnlink = (req, res, next) => {
    const provider = req.params.provider;
    User.findById(req.user.id, (err, user) => {
        if (err) { return next(err); }
        user[provider] = undefined;
        user.tokens = user.tokens.filter(token => token.kind !== provider);
        user.save((err) => {
            if (err) { return next(err); }
            req.flash('info', { msg: `${provider} account has been unlinked.` });
            res.redirect('/account');
        });
    });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    User
        .findOne({ passwordResetToken: req.params.token })
        .where('passwordResetExpires').gt(Date.now())
        .exec((err, user) => {
            if (err) { return next(err); }
            if (!user) {
                req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
                return res.redirect('/forgot');
            }
            res.render('account/reset', {
                title: 'Password Reset',
                fullscreen: true
            });
        });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = (req, res, next) => {
    req.assert('password', 'Password must be at least 4 characters long.').len(4);
    req.assert('confirm', 'Passwords must match.').equals(req.body.password);

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('back');
    }

    const resetPassword = () =>
        User
        .findOne({ passwordResetToken: req.params.token })
        .where('passwordResetExpires').gt(Date.now())
        .then((user) => {
            if (!user) {
                req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
                return res.redirect('back');
            }
            user.password = req.body.password;
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            return user.save().then(() => new Promise((resolve, reject) => {
                req.logIn(user, (err) => {
                    if (err) { return reject(err); }
                    resolve(user);
                });
            }));
        });

    const sendResetPasswordEmail = (user) => {
        if (!user) { return; }
        const mailOptions = {
            to: user.email,
            from: 'dust@dusthq.com',
            subject: 'Your Dust password has been changed',
            text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
        };
        return transporter.sendMail(mailOptions)
            .then(() => {
                req.flash('success', { msg: 'Success! Your password has been changed.' });
            });
    };

    resetPassword()
        .then(sendResetPasswordEmail)
        .then(() => { if (!res.finished) res.redirect('/'); })
        .catch(err => next(err));
};

/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.render('account/forgot', {
        title: 'Forgot Password',
        fullscreen: true
    });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = (req, res, next) => {
    req.assert('email', 'Please enter a valid email address.').isEmail();
    req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/forgot');
    }

    const createRandomToken = crypto
        .randomBytesAsync(16)
        .then(buf => buf.toString('hex'));

    const setRandomToken = token =>
        User
        .findOne({ email: req.body.email })
        .then((user) => {
            if (!user) {
                req.flash('errors', { msg: 'Account with that email address does not exist.' });
            } else {
                user.passwordResetToken = token;
                user.passwordResetExpires = Date.now() + 3600000; // 1 hour
                user = user.save();
            }
            return user;
        });

    const sendForgotPasswordEmail = (user) => {
        if (!user) { return; }
        const token = user.passwordResetToken;
        const mailOptions = {
            to: user.email,
            from: 'dust@dusthq.com',
            subject: 'Reset your password on Dust',
            text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        http://${req.headers.host}/reset/${token}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };
        return transporter.sendMail(mailOptions)
            .then(() => {
                req.flash('info', { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
            });
    };

    createRandomToken
        .then(setRandomToken)
        .then(sendForgotPasswordEmail)
        .then(() => res.redirect('/forgot'))
        .catch(next);
};

/**
 * POST /founder/signup
 * Process founder signup
 */
exports.postFounderSignup = (req, res, next) => {
    req.assert('firstName', 'First name can not be empty').notEmpty();
    req.assert('lastName', 'Last name can not be empty').notEmpty();
    req.assert('mvp_description', 'MVP Description can not be empty').notEmpty();
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/');
    }

    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        isDeveloper: false,
        password: req.body.password,
        timezone: req.body.timezone
    });

    User.findOne({ email: req.body.email }, (err, existingUser) => {
        if (err) { return next(err); }
        if (existingUser) {
            req.flash('errors', { msg: 'Account with that email address already exists, you should login or reset your password' });
            return res.redirect('/');
        }
        user.save((err) => {
            if (err) { return next(err); }
            const project = new Project({
                email: req.body.email,
                project: req.body.mvp_description,
                platform: req.body.platforms,
                timezone: req.body.timezone
            });
            project.save((err) => {
                if (err) { return next(err); }
                res.redirect('http://paypal.me/paydusthq');
            });

            // req.logIn(user, (err) => {
            //   if (err) {
            //     return next(err);
            //   }
            //   res.redirect('http://paypal.me/paydusthq');
            // });
        });
    });
};


/**
 * GET /dev/signup
 * Show Developer Sign up Page
 */
exports.getDeveloperSignup = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/dev/signup');
    }
    res.render('account/dev-signup', {
        title: 'Developer Registration',
        fullscreen: true,
        fixedHeader: true
    });
};

/**
 * POST /dev/signup
 * Process The Developer Sign up Form
 */
exports.postDeveloperSignup = (req, res, next) => {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/dev/signup');
    }

    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        location: req.body.location,
        website: req.body.website,
        title: req.body.title,
        twitter: req.body.twitter,
        producthunt: req.body.producthunt,
        days: req.body.daysToBuildMVP,
        price: req.body.priceToBuildMVP,
        password: req.body.password,
        timezone: req.body.timezone
    });

    User.findOne({ email: req.body.email }, (err, existingUser) => {
        if (err) { return next(err); }
        if (existingUser) {
            req.flash('errors', { msg: 'Account with that email address already exists.' });
            return res.redirect('/dev/signup');
        }
        user.save((err) => {
            if (err) { return next(err); }
            res.redirect('https://docs.google.com/document/d/1gGv0ePSdYbfYxatjZs7dAXQwmdZxcFZbruBF36GZggo/edit');
            // req.logIn(user, (err) => {
            //   if (err) {
            //     return next(err);
            //   }
            //   res.redirect('/?welcome=true');
            // });
        });
    });
};

exports.mvpform = (req, res, next) => {
    const project = new Project({
        email: req.user.email,
        project: req.body.mvp_description,
        platform: req.body.platforms,
        timezone: req.body.timezone
    });
    project.save((err) => {
        if (err) { return next(err); }
        res.redirect('http://paypal.me/paydusthq');
    });
};

exports.mvpbuild = (req, res, next) => {
    const mvpbuild = new MvpBuild({
        name: req.body.name,
        email: req.body.email,
        description: req.body.description,
        features: req.body.features,
        total: req.body.total
    });
    mvpbuild.save((err) => {
        if (err) { return next(err); }
        res.redirect('/pay');
    });
};
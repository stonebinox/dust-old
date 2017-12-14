const _ = require('lodash');
const geoip = require('geoip-lite');
const keyPublishable = process.env.PUBLISHABLE_KEY;
const keySecret = process.env.SECRET_KEY;
const stripe = require("stripe")(keySecret);

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
};

exports.help = (req, res) => {
    res.render('help', {
        title: 'Help Guide',
        fixedHeader: true
    })
};

exports.resources = (req, res) => {
    res.render('resources', {
        title: 'Resources',
        fixedHeader: true
    })
};

exports.education = (req, res) => {
    res.render('education', {
        title: 'Education',
        fixedHeader: true
    });
};

exports.enterprise = (req, res) => {
    res.render('enterprise', {
        title: 'Enterprise',
        fixedHeader: true
    });
};

exports.blog = (req, res) => {
    res.redirect("http://blog.dusthq.com")
}

exports.getpay = (req, res) => {
    res.render('pay', {
        title: 'Pay',
        keyPublishable
    });
};

exports.postpay = (req, res, next) => {
    let amount = 2500;

    stripe.customers.create({
            email: req.body.stripeEmail,
            source: req.body.stripeToken
        })
        .then(customer =>
            stripe.charges.create({
                amount,
                description: "Payment for MVP booking",
                currency: "usd",
                customer: customer.id
            }))
        .then(charge => res.render("charge"));
};
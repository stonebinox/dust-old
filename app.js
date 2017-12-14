/**
 * Module dependencies.
 */
const _ = require('lodash');
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const forceSSL = require('force-ssl-heroku');
const ejs = require('ejs-mate');
const requestIp = require('request-ip');
const socketEvents = require('./socket');
const md5File = require('md5-file');
const adminMiddleware = require('./middlewares/isAdmin');


/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
if (process.env.NODE_ENV !== 'production') {
    dotenv.load({ path: '.env' });
}

/**
 * Controllers (route handlers).
 */
const routes = require('./routes');

/**
 * Create Express server.
 */
const app = express();

// Bit uggly, but easy to delegate to fusebox later on.
app.locals.hashCSSapp = md5File.sync(path.join(__dirname, 'public/css/app.css'));
app.locals.hashCSSmessages = md5File.sync(path.join(__dirname, 'public/css/messages.css'));
app.locals.hashCSSsettings = md5File.sync(path.join(__dirname, 'public/css/settings.css'));
app.locals.hashJSapp = md5File.sync(path.join(__dirname, 'public/js/app.js'));
app.locals.hashJSchat = md5File.sync(path.join(__dirname, 'public/js/dist/chat.js'));
app.locals.hashJSmessages = md5File.sync(path.join(__dirname, 'public/js/dist/messages.js'));
app.locals.hashJSsettings = md5File.sync(path.join(__dirname, 'public/js/dist/settings.js'));

app.locals.scriptJSapp = `<script src="/js/app.js?${app.locals.hashJSapp}"></script>`;
app.locals.scriptJSmessages = `<script src="/js/dist/messages.js?${app.locals.hashJSmessages}"></script>`;
app.locals.scriptJSchat = `<script src="/js/dist/chat.js?${app.locals.hashJSchat}"></script>`;
app.locals.scriptJSsettings = `<script src="/js/dist/settings.js?${app.locals.hashJSsettings}"></script>`;


/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI, { useMongoClient: true });
mongoose.connection.on('error', (err) => {
    console.error(err);
    console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
    process.exit();
});

/**
 * Express configuration.
 */
app.use(forceSSL);
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejs);
app.set('view engine', 'ejs');
app.use(compression());
app.use(logger('dev'));
app.use(requestIp.mw());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
        url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
        autoReconnect: true,
        clear_interval: 3600
    })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
    lusca.csrf()(req, res, next);
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
    const email = _.get(req, 'user.email', '');

    res.locals.user = req.user;
    res.locals.isAdmin = adminMiddleware.adminList.includes(email);
    next();
});
app.use((req, res, next) => {
    // After successful login, redirect back to the intended page
    if (!req.user &&
        req.path !== '/login' &&
        req.path !== '/signup' &&
        !req.path.match(/^\/auth/) &&
        !req.path.match(/\./)) {
        req.session.returnTo = req.path;
    } else if (req.user &&
        req.path === '/account') {
        req.session.returnTo = req.path;
    }
    next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));


/**
 * Primary app router and middlewares
 */
app.use('/', routes);

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
const server = require('http').createServer(app);
const io = require('socket.io')(server);

socketEvents(io);

server.listen(app.get('port'), () => {
    console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
    console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
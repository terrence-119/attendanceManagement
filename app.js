var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


const bodyParser = require('body-parser'); // ボディ（コンテンツが用意されるところ）に特定のフォーマットのパース機能を追加する
const session = require('express-session');


var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');
const { body } = require('express-validator');


var app = express();

var session_opt = {
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 60 * 60 * 1000}
}

app.use(session(session_opt));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended: false})); // URLエンコーディングをON
app.use(bodyParser.json()); // JSONフォーマットのパース処理機能を追加


app.use('/', indexRouter);
app.use('/api', apiRouter);

module.exports = app;

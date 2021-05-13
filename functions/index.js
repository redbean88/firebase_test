const express = require("express");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
// const routes = require("./routes/index");
const functions = require("firebase-functions");

// Router handler
const taxinvoice = require("./routes/taxinvoice");
const statement = require("./routes/statement");
const cashbill = require("./routes/cashbill");
const message = require("./routes/message");
const kakao = require("./routes/kakao");
const fax = require("./routes/fax");
const htTaxinvoice = require("./routes/httaxinvoice");
const htCashbill = require("./routes/htcashbill");
const closedown = require("./routes/closedown");
const easyfinbank = require("./routes/easyfinbank");
const accountCheck = require("./routes/accountCheck");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use("/", routes);
// Direct ./routes/index.js

// app.use(route URI Schema, route handler)
app.use("/TaxinvoiceService", taxinvoice);
app.use("/StatementService", statement);
app.use("/CashbillService", cashbill);
app.use("/MessageService", message);
app.use("/KakaoService", kakao);
app.use("/FaxService", fax);
app.use("/HTTaxinvoiceService", htTaxinvoice);
app.use("/HTCashbillService", htCashbill);
app.use("/ClosedownService", closedown);
app.use("/EasyFinBankService", easyfinbank);
app.use("/AccountCheckService", accountCheck);

// catch 404 and forward to error handler
/* app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;  next(err);
});*/

// error handlers

// development error handler
// will print stacktrace
/* if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}*/

// production error handler
// no stacktraces leaked to user
/* app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});*/

const index = require("./routes/index");

app.use("/", index);

const api = functions.https.onRequest(app);

module.exports = {
  api,
};

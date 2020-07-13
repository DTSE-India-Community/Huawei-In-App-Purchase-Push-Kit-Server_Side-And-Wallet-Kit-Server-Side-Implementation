const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const moment = require('moment');

// Import API'S from different location...
var appToken = require('./hmsapis/appLevelAccessToken');
var sendNotify = require('./hmsapis/sendNotification');
var appTokenSubsription = require('./hmsapis/appLevelAccessTokenSubscription');
var subsriptionDetails = require('./hmsapis/getSubcriptionProductDetails');
var subscriptionCancel = require('./hmsapis/getSubcriptionProductCanceled');
var subscriptionRefund = require('./hmsapis/getSubcriptionProductRefund');
var subscriptionRevoke = require('./hmsapis/getSubcriptionProductRevoke');

//Variables...
var arrToken = [];
var productList = [];
var appLevelAccesToken;
var pushMessage = "";
var titleMsg = "";
var notifySucesssMessage = "";
var message = "";
var mongoDbUrl = "mongodb://localhost:27017/hms";

//ejs engine ...
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

//Body Parser ...
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware..
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/img'));


// Database Connection ...
MongoClient.connect(mongoDbUrl, { useUnifiedTopology: true }, (err, db) => {

    if (err) return console.log(err)

    app.listen(3030, () => {
        console.log('app working on 3030')
    });

    // CALL LOCALHOST:3030
    app.get('/', (req, res) => {
        
        dbase.collection('subscriptionProduct').aggregate([
            {
                $group:
                {
                    _id: 0,
                    PurchaseToken: { $addToSet: '$purchaseToken' },
                    SubcriptionId: { $addToSet: '$subscriptionId' },

                }
            }]).toArray(function (err, results) {
                if (results.length > 0)
                    console.log(results);
                var purchasetk = results.reduce(function (obj, doc) {
                    obj[doc._id] = doc.PurchaseToken
                    return obj;
                }, {});
                var subscribeId = results.reduce(function (obj, doc) {
                    obj[doc._id] = doc.SubcriptionId
                    return obj;
                }, {});
                // console.log(purchasetk['0'][0]);
                // console.log(subscribeId['0'][0]);

                appTokenSubsription.getAppToken((callBack) => {
                    let oriString = 'APPAT:' + callBack;
                    let authorization = new Buffer.from(oriString).toString('base64');
                    if (purchasetk['0'] != undefined)
                        for (let i = 0; i < purchasetk['0'].length; i++) {
                            console.log("AUTH " + i, authorization);
                            subsriptionDetails.getSubscriptionDetails(authorization, subscribeId['0'][i], purchasetk['0'][i], callBackMessage => {

                                console.log(subscribeId['0'][i] + " >>>>> ", callBackMessage);
                                if (callBackMessage != undefined) {
                                    var subscr = JSON.parse(callBackMessage);
                                    console.log("subIsValid", subscr.purchaseState);
                                    dbase.collection('subscriptionProduct').update({ purchaseToken: subscr.purchaseToken }, {
                                        userId: 'sanghati.mukherjee@huawei.com',
                                        purchaseToken: subscr.purchaseToken,
                                        subscriptionId: subscr.subscriptionId,
                                        subIsvalid: subscr.subIsvalid,
                                        productId: subscr.productId,
                                        productName: subscr.productName,
                                        purchaseState: subscr.purchaseState,
                                        currency: subscr.currency,
                                        price: subscr.price,
                                        purchaseTime: subscr.purchaseTime,
                                        country: subscr.country,
                                        expirationDate: subscr.expirationDate
                                    });

                                }
                            });
                        }
                });


            });
        dbase.collection('subscriptionProduct').find().toArray((err, results) => {
            console.log("I AM HERE ...");
            res.render(__dirname + "/public/index.ejs", { productList: results, notifySucesssMessage: " ", message: " " });

        });
    });

    let dbase = db.db("hmstoken");

    // ADD TOKEN ....
    app.post('/addToken', (req, res, next) => {

        let token = {
            token: req.body.token,
        };

        // Insert token ...
        dbase.collection("token").insertOne(token, (err, result) => {
            if (err) {
                console.log(err);
                res.sendStatus(400);
            } else {
                res.sendStatus(200);
                //res.status(200).send();
            }

        });

    });

    // SEND NOTIFICATION ...
    app.post('/SendNotification', (req, res, next) => {

        // Getting value from index.html
        pushMessage = req.body.pushMessage;
        titleMsg = req.body.titleMsg;


        // Fetching Token from mongodb ...
        dbase.collection('token').find().toArray((err, results) => {
            if (results) {

                //clear the token list ...
                arrToken = [];

                // adding token in the list ...
                for (var i = 0; i < results.length; i++) {
                    console.log("Token " + i + " " + results[i].token);
                    arrToken.push(results[i].token);
                }
        
                // if error code 401 returned it means access token becomes invalid
                // and we need to obtain a new token. Token Validity is 60 mins...
                // fetchin app level access token here ... 
                appToken.getAppToken((callBack) => {
                    console.log("TOKEN >>>" + callBack);
                    appLevelAccesToken = callBack;
                    sendNotify.sendNotify(appLevelAccesToken, arrToken, titleMsg, pushMessage, callBackMessage => {
                        notifySucesssMessage = callBackMessage;
                        console.log(notifySucesssMessage);
                        if (notifySucesssMessage == 'Success') {
                            res.render(__dirname + "/public/index.ejs", { notifySucesssMessage: "Notification Send Successfully...", message: " " });
                            notifySucesssMessage = "";
                        }
                    });
                });
            }
        });
    });

    // SUBSCRIPTION ...

    // add Subcription details from client ...
    app.post('/addSubscriptionProduct', (req, res, next) => {
        console.log("It is calling...")
        dbase.collection('subscriptionProduct').findOne({ "purchaseToken": req.body.purchaseToken }, function (findErr, result) {

            if (result == null) {

                let subscriptionToken = {
                    userId: req.body.userId,
                    purchaseToken: req.body.purchaseToken,
                    subscriptionId: req.body.subscriptionId,
                    subIsvalid: req.body.subIsvalid,
                    productId: req.body.productId,
                    productName: req.body.productName,
                    purchaseState: req.body.purchaseState,
                    currency: req.body.currency,
                    price: req.body.price,
                    purchaseTime: req.body.purchaseTime,
                    country: req.body.country,
                    expirationDate: req.body.expirationDate
                };

                // Insert token ...
                dbase.collection("subscriptionProduct").insertOne(subscriptionToken, (err, result) => {
                    if (err) {
                        console.log(err);
                        res.sendStatus(400);
                    } else {
                        res.sendStatus(200);
                        //res.status(200).send();
                    }

                });
            }
        });

    });

    // We call this method to cancel an already subscribed product, 
    // the subscription is still valid during the validity period, and 
    // subsequent renewals will be terminated.
    // Subscription Canceled API ...
    app.post('/subscriptionCancell/:purchaseToken/:subscriptionId', (req, res, next) => {

        let purchaseTokenVal = req.params.purchaseToken;
        let subscriptionIdVal = req.params.subscriptionId;

        console.log("getPurchase >>>", purchaseTokenVal)
        console.log("getsubscriptionId", subscriptionIdVal)
        
        // if error code 401 returned it means access token becomes invalid
        // and we need to obtain a new token. Token Validity is 60 mins...

        appTokenSubsription.getAppToken((callBack) => {
            // responseCode:"6","responseMessage":"900030-authorization format invalid"
            // Check the format of the token you are putting in header as authorization ...
            let oriString = 'APPAT:' + callBack;
            let authorization = new Buffer.from(oriString).toString('base64');
            console.log("AUTH ", authorization);
            subscriptionCancel.getSubscriptionCanceled(authorization, subscriptionIdVal, purchaseTokenVal, callBackMessage => {
                console.log("CANCELED >>>", callBackMessage);
                if (callBackMessage.responseCode == '0') {

                    dbase.collection('subscriptionProduct').find().toArray((err, results) => {

                        res.render(__dirname + "/public/index.ejs", { productList: results, notifySucesssMessage: " ", message: "Subscription Canceled Successfully" });

                    });

                } else {
                    dbase.collection('subscriptionProduct').find().toArray((err, results) => {

                        res.render(__dirname + "/public/index.ejs", { productList: results, notifySucesssMessage: " ", message: callBackMessage.responseMessage });

                    });

                }

            });

        });
    });

    // We call this method to refund the last renewal fee of a subscription product, 
    // but the subscription product is still valid during the validity period, and subsequent
    // renewals will be performed normally.
    // Subscription Refund API...
    app.post('/subscriptionRefund/:purchaseToken/:subscriptionId', (req, res, next) => {

        purchaseToken = req.params.purchaseToken;
        subscriptionId = req.params.subscriptionId;

        console.log("getPurchase", purchaseToken)
        appTokenSubsription.getAppToken((callBack) => {
            let oriString = 'APPAT:' + callBack;
            let authorization = new Buffer.from(oriString).toString('base64');
            console.log("AUTH ", authorization);
            subscriptionRefund.getSubscriptionRefund(authorization, subscriptionId, purchaseToken, callBackMessage => {
                console.log("CANCELED >>>", callBackMessage);
                if (callBackMessage.responseCode == '0') {

                    dbase.collection('subscriptionProduct').find().toArray((err, results) => {

                        res.render(__dirname + "/public/index.ejs", { productList: results, notifySucesssMessage: " ", message: "Subscription Refunded Successfully" });

                    });

                } else {
                    dbase.collection('subscriptionProduct').find().toArray((err, results) => {

                        res.render(__dirname + "/public/index.ejs", { productList: results, notifySucesssMessage: " ", message: callBackMessage.responseMessage });

                    });

                }
            });
        });
    });

    // We call this method to cancel a subscription, 
    // which is equivalent to executing the refund api and
    // immediately ending the subscription service and subsequent renewal.
    // Subscription Revoke API...
    app.post('/subscriptionRevoke/:purchaseToken/:subscriptionId', (req, res, next) => {

        purchaseToken = req.params.purchaseToken;
        subscriptionId = req.params.subscriptionId;

        console.log("getPurchase", purchaseToken)
        appTokenSubsription.getAppToken((callBack) => {
            let oriString = 'APPAT:' + callBack;
            let authorization = new Buffer.from(oriString).toString('base64');
            console.log("AUTH ", authorization);
            
            subscriptionRevoke.getSubscriptionRevoke(authorization, subscriptionId, purchaseToken, callBackMessage => {
                console.log("CANCELED >>>", callBackMessage);
                if (callBackMessage.responseCode == '0') {

                    dbase.collection('subscriptionProduct').find().toArray((err, results) => {

                        res.render(__dirname + "/public/index.ejs", { productList: results, notifySucesssMessage: " ", message: "Subscription Revoked Successfully" });

                    });

                } else {
                    dbase.collection('subscriptionProduct').find().toArray((err, results) => {

                        res.render(__dirname + "/public/index.ejs", { productList: results, notifySucesssMessage: " ", message: callBackMessage.responseMessage });

                    });

                }
            });
        });
    });



    // DELETE ALL TOKEN...
    app.get('/deleteAllToken', (req, res, next) => {
        dbase.collection('token').deleteMany({}, function (err, results) {
            console.log(results.result);
            notifySucesssMessage = "Record Deleted Successfully...";
            backURL = req.header('Referer') || '/';
            res.redirect(backURL);
        });
    });

    // DELETE ALL SUBCRIPTION PRODUCT...
    app.get('/deleteAllSubscription', (req, res, next) => {
        dbase.collection('subscriptionProduct').deleteMany({}, function (err, results) {
            console.log(results.result);
            notifySucesssMessage = "Record Deleted Successfully...";
            backURL = req.header('Referer') || '/';
            res.redirect(backURL);
        });
    });

    app.locals.convertDateTime = function(arg){
        let dateTime = new Date(+arg);
        
        return dateTime.getDate() +
            "/" + (dateTime.getMonth() + 1) + "/" + dateTime.getFullYear() + "\n"
            + dateTime.getHours() + ":" + dateTime.getMinutes() + ":" + dateTime.getSeconds();
    }

});
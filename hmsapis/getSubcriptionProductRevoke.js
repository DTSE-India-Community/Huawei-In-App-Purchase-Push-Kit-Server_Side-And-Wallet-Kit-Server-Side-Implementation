var request = require("request");

const getSubscriptionRevoke = (authorizationVal, subscriptionIdVal, purchaseTokenval,callBack) => {
   // console.log(">>>" + purchaseTokenval)
    var options = {
        method: 'POST',
        url: 'https://subscr-dra.iap.hicloud.com/sub/applications/v2/purchases/withdrawal',
        headers:
        {
            'cache-control': 'no-cache',
            authorization: 'Basic '+authorizationVal,
            'content-type': 'application/json'
        },
        body:
        {
            subscriptionId: subscriptionIdVal,
            purchaseToken: purchaseTokenval
        },
        json: true
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        var subscr = JSON.parse(JSON.stringify(body));
        
        callBack(subscr);

    });
}
exports.getSubscriptionRevoke = getSubscriptionRevoke;

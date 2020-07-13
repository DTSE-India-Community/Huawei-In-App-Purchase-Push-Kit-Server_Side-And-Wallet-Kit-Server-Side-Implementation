var request = require("request");

const getSubscriptionDetails = (authorizationVal, subscriptionIdVal, purchaseTokenval,callBack) => {
   // console.log(">>>" + purchaseTokenval)
    var options = {
        method: 'POST',
        url: 'https://subscr-dra.iap.hicloud.com/sub/applications/v2/purchases/get',
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
        //  console.log(">>>"+notify.msg);
      //  console.log(">>>" + notify.inappPurchaseData);
        callBack(subscr.inappPurchaseData);

    });
}
exports.getSubscriptionDetails = getSubscriptionDetails;

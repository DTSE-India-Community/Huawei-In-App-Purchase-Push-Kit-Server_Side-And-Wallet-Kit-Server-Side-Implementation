var request = require("request");

const sendNotify = (appLevelToken, tokenVal, titleMsg, pushMessage, callBack) => {
    var options = {
        method: 'POST',
        url: 'https://push-api.cloud.huawei.com/v1/{PUT_YOUR_APPID}/messages:send',
        headers:
        {
            authorization: 'Bearer ' + appLevelToken,
            host: 'oauth-login.cloud.huawei.com',
            post: '/oauth2/v2/token HTTP/1.1',
            'content-type': 'application/json'
        },
        body:
        {
            validate_only: false,
            color: '#8E44AD',
            message:
            {
                notification: { title: titleMsg, body: pushMessage },
                android:
                {
                    notification:
                    {
                        title: titleMsg,
                        body: pushMessage,
                        click_action: { type: 1, intent: '#Intent;compo=com.rvr/.Activity;S.W=U;end' }
                    }
                },
                token: tokenVal
            }
        },
        json: true
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        //  console.log(body);
        var notify = JSON.parse(JSON.stringify(body));
        //  console.log(">>>"+notify.msg);
        callBack(notify.msg);
    });
}
exports.sendNotify = sendNotify;

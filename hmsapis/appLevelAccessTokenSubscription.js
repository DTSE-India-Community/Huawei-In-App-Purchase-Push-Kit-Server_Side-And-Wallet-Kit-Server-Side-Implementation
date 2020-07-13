var request = require("request");

const getAppToken = (callBack) => {

    var options = {
        method: 'POST',
        url: 'https://oauth-login.cloud.huawei.com/oauth2/v3/token',
        headers:
        {
            'content-type': 'application/x-www-form-urlencoded',
            host: 'Login.cloud.huawei.com',
            post: '/oauth2/v2/token HTTP/1.1'
        },
        form:
        {
            grant_type: "client_credentials",
            client_secret: 'GET_YOUR_APP_SECRET_FROM_AGC_CONSOLE_OF_IAP_KIT_PROJECT',
            client_id: 'GET_YOUR_APP_ID_FROM_AGC_CONSOLE_OF_IAP_KIT_PROJECT'
        }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        var tokenValue = JSON.parse(body);
        callBack(tokenValue.access_token);
    });
}
exports.getAppToken = getAppToken;

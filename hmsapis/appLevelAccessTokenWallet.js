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
            client_secret: 'Put Your Client Secret Here...',
            client_id: 'Put Your APP ID Here ...'
        }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        var tokenValue = JSON.parse(body);
        callBack(tokenValue.access_token);
    });
}
exports.getAppToken = getAppToken;

var request = require("request");

const getEventTIcketModelObject = (authorizationVal, ticketBookingDate,callBack) => {
var options = { 
  method: 'POST',
  url: 'https://passentrust-dra.wallet.hicloud.com/hmspass/v1/eventticket/model',
  headers: 
   { 
        'cache-control': 'no-cache',
        accept: 'application/json',
        authorization: 'Bearer '+authorizationVal,
        'content-type': 'application/json' 
    },
  body: 
   { passVersion: '1.0',
   passTypeIdentifier: 'YOUR_SERVICE_ID',
   passStyleIdentifier: 'YOUR_MODEL_ID',
     organizationName: 'Huawei',
     fields: 
      { countryCode: 'zh',
        locationList: [ { longitude: '114.0679603815', latitude: '22.6592051284' } ],
        commonFields: 
         [ 
          { key: 'logo', value: 'https://contentcenter-drcn.dbankcdn.com/cch5/Wallet-WalletKit/picres/cloudRes/coupon_logo.png' },
           { key: 'name', value: 'Is Show Time Movie Ticket' },
           { key: 'merchantName',
             value: 'Huawei',
             localizedValue: 'merchantNameI18N' },
           { key: 'address', value: 'INOX Cinema' },
           { key: 'ticketType', value: 'Movie ticket' } ],
        appendFields: [ { key: 'backgroundColor', value: '#3e454f' } ],
        timeList: 
         [ { key: 'startTime', value: ticketBookingDate },
           { key: 'endTime', value: '2020-08-20T00:00:00.111Z' } ],
        localized: 
         [ { key: 'merchantNameI18N', language: 'zh-cn', value: '华为' },
           { key: 'merchantNameI18N', language: 'en', value: 'Huawei' } 
        ] 
       }
     },
  json: true };

    request(options, function (error, response, body) {
        if (error) {
        ///callBack(error)
          callBack(error,error);
        }
        else{
          callBack(body);
        }
    });
}
exports.getEventTIcketModelObject = getEventTIcketModelObject;

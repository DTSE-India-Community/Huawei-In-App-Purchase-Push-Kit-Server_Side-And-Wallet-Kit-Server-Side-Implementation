var request = require("request");

const getEventTIcketInstanceObject = (authorizationVal, serialNumber, ticketBookingDate,seatNumber,userName, movieName,callback) => {
var options = { 
 method: 'POST',
  url: 'https://passentrust-dra.wallet.hicloud.com/hmspass/v1/eventticket/instance',
  headers: 
   { 
     'cache-control': 'no-cache',
     accept: 'application/json',
     authorization: 'Bearer '+authorizationVal,
     'content-type': 'application/json' },
  body: 
   { 
    organizationPassId: 'YOUR_APP_ID',
     passTypeIdentifier: 'YOUR_SERVICE_ID',
     passStyleIdentifier: 'YOUR_MODEL_ID',
     serialNumber: serialNumber,
     fields: 
      { status: 
         { state: 'active',
           effectTime: ticketBookingDate,
           expireTime: '2020-08-20T00:00:00.111Z' },
        barCode: 
         { text: '562348969211212',
           type: 'codabar',
           value: '562348969211212',
           encoding: 'UTF-8' },
        commonFields: 
         [ { key: 'ticketNumber', value: serialNumber },
           { key: 'title', value: 'Its Show Time' },
           { key: 'name', value: movieName },
           {key:'programImage', value:'https://contentcenter-drcn.dbankcdn.com/cch5/Wallet-WalletKit/picres/cloudRes/coupon_logo.png'}
         ],
        appendFields: 
         [ { key: 'gate', value: 'Gate 2', label: 'Gate' },
           { key: 'seat', value: '24', label: 'Seat' },
           { key: 'userName', value: userName } 
        ] 
    }
     },
  json: true };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  //console.log(body);
  var data = JSON.parse(JSON.stringify(body));
 // console.log(data)
  callback(body);
});
}
exports.getEventTIcketInstanceObject = getEventTIcketInstanceObject;

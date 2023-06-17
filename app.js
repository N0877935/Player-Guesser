var https = require('follow-redirects').https;
var fs = require('fs');

var options = {
  'method': 'GET',
  'hostname': 'v3.football.api-sports.io',
  'path': '/teams?league=39&season=2021',
  'headers': {
    'x-rapidapi-key': 'a6cad2bfc27abf2bbc35170221a7c9e7',
    'x-rapidapi-host': 'v3.football.api-sports.io'
  },
  'maxRedirects': 20
};

var req = https.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function (chunk) {
    var body = Buffer.concat(chunks);
    console.log(body.toString());
  });

  res.on("error", function (error) {
    console.error(error);
  });
});

req.end();
var socket = require('socket.io')
  , http = require('http')
  , twitter = require('twit')
  , express = require('express')
  , path = require('path')
  , app = express();

app.use(express.static(path.join(__dirname, 'public')));

var server = http.createServer(app);
var io = socket.listen(server);

var t = new twitter({
    consumer_key: "k8Owe3iZwGMUgD1Dn64lTKN32",          
    consumer_secret: "6HhPFD747pq9iXbHNoqCMclqGa1Ibd4IhvWC7h6bBY8h7hp762",       
    access_token: "942399211-7J7mUWuEC1shJHXRnFvKyEFUJVhRh9aFfQd43BzB",      
    access_token_secret: "EPXwymTXCdTWkMzcxlnVYsI0Gexxo4mB1505idQ40jb9k"
});

app.set('port', process.env.PORT || 8080);

function setPage() {
  app.all('/', function(request, response) {
    response.sendfile('views/index.html');
  });
}

function openTweetConnection() {
  io.sockets.on('connection', function(client) {
    catchError(client);
    streamTweets(client);
  });
}

function catchError(client) {
  client.on('error', function() {
    console.log('error catch!');
  });
}

function streamTweets(client) {
  var stream = t.stream('statuses/sample');
  stream.on('tweet', function(tweet) {
    if (tweet.geo !== null) {
      client.emit('tweets', JSON.stringify(tweet));
    }
  });
}

function listenToServer() {
  server.listen(8080);
}

(function() {
  setPage();
  openTweetConnection();
  listenToServer();
})()
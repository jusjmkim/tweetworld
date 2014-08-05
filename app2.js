var socket = require('socket.io')
  , http = require('http')
  , twitter = require('ntwitter')
  , express = require('express')
  , path = require('path')
  , util = require('util')
  , app = express();

app.use(express.static(path.join(__dirname, 'public')));

var server = http.createServer(app);
var io = socket.listen(server);

var t = new twitter({
    consumer_key: "k8Owe3iZwGMUgD1Dn64lTKN32",          
    consumer_secret: "6HhPFD747pq9iXbHNoqCMclqGa1Ibd4IhvWC7h6bBY8h7hp762",       
    access_token_key: "942399211-7J7mUWuEC1shJHXRnFvKyEFUJVhRh9aFfQd43BzB",      
    access_token_secret: "EPXwymTXCdTWkMzcxlnVYsI0Gexxo4mB1505idQ40jb9k"
});

app.set('port', process.env.PORT || 8080);

app.get('/', function(request, response) {
  console.log('This half works...');
  response.sendfile('views/index.html');
});

io.sockets.on('connection', function(client) {
  console.log('Server is connected...');
  client.on('error', function() {
    console.log('error catch!');
  });
  t.stream('statuses/sample',function(stream) {
    stream.on('data', function(tweet) {
      if (tweet.geo !== null) {
         client.emit('tweets', {text: tweet});
      }
    });
    stream.on('end', function (response) {
      // Handle a disconnection
    });
    stream.on('destroy', function (response) {
      // Handle a 'silent' disconnection from Twitter, no end/error event fired
    });
    stream.on('error', function(error) {
      console.log('Tweet errror');
      console.log(util.inspect(error));
    });
  });
});

server.listen(8080);
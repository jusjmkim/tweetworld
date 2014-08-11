var env = require('./config/environment.js')()
  , app = env.express()
  , database = require('models/index.js')
  , User = database.sequelize.import(__dirname + "/models/user.js")
  , Country = database.sequelize.import(__dirname + "/models/country.js")
  , apikeys = require('./config/apikeys.js')();

//go into models/index.js and change your database settings from ilanasufrin to yours

//RUN THIS LOCALLY: create database "TweetWorld";
//var conString = "postgres://ilanasufrin:@localhost:5432/TweetWorld";

app.use(env.session({secret: 'topsecretsecret',
                saveUninitialized: true,
                resave: true,
                cookie: {maxAge: 6000}}));
app.use(env.express.static(env.path.join(__dirname, 'public')));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(env.cookieParser());
app.use(env.bodyParser());
app.use(env.passport.initialize());
app.use(env.passport.session());
app.use(env.flash());

env.db
  .sequelize
  .authenticate()
  .complete(function(err) {
    if (err) {
      throw err[0]
    } else {
      env.http.createServer(app).listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('env.port'))
      })
    }
  })

require('./config/passport')(env.passport);
require('./routes/routes.js')(app, env.passport);

var server = env.http.createServer(app);
var io = env.socket.listen(server);
var client;

var t = new env.twitter({
    consumer_key: apikeys.consumer_key,          
    consumer_secret: apikeys.consumer_secret,       
    access_token: apikeys.access_token,      
    access_token_secret: apikeys.access_token_secret
});
var stream = t.stream('statuses/sample');

function openTweetConnection() {
  io.sockets.on('connection', function(clientSide) {
    client = clientSide;
    catchError();
    streamTweets();
    getUsername();
    getCountry();
  });
}

function catchError() {
  client.on('error', function() {
    console.log('error catch!');
  });
}

function streamTweets() {
  stream.on('tweet', function(tweet) {
    if (tweet.place !== null) {
      console.log(tweet);
      client.emit('tweets', JSON.stringify(tweet));
    }
  });
}

function getUsername() {
  client.on('username', function(username) {
    findUser(username);
  });
}

function findUser(username) {
  User.find({where: {'username': username}})
  .success(function(user) {
    sendUsersCountries(user);
  });
}

function sendUsersCountries(user) {
  user.getCountries()
  .success(function(countries) {
    client.emit('username', countries);
  });
}

function getCountry() {
  client.on('country', function(countryObj) {
    var country = JSON.parse(countryObj);
    persistCountry(country.name, country.user);
  });
}

function persistCountry(countryName, username) {
  Country.findOrCreate({'name': countryName})
  .success(function(country, created) {
    if (created) {
      User.find({where: {'username': username}})
      .success(function(user) {
        user.addCountry(country);
      });
    }
  });
}

function listenToServer() {
  server.listen(env.port);
  server.listen('8080/dashboard');
}

(function() {
  openTweetConnection();
  listenToServer();
})()
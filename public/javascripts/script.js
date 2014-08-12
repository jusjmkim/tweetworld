var server = io.connect('http://localhost:8080');
server.on('error', function() {
  server.socket.connect();
});

function insertTweet(tweet, country) {
  var $countryUl = $("#" + country + " ul");
  if  ($countryUl.children().length > 9) {
    $("#" + country +" li").last().remove();
  }
  $countryUl.prepend('<li>' + tweet.text + '</li>');
}

function normalizeName(name) {
  return name.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"").split(" ").join("-");
}

function submitListener() {
  $("#submit").click(function(e) {
    var $country = states[$("#country").val()];
    var country = normalizeName($country);
    addNewCountry($country, country);
    e.preventDefault();
  });
}

function addNewCountry($country, country) {
  if($("#" + country).length === 0) {
    var newCountry = "<div id='" + country + "' class='col-md-4 country_tweet_panel'>" + 
      "<h2>" + $("#country").val() + "</h2><ul></ul></div>"
    $(".tweet_country_holder").append(newCountry);
  }
}

function tweetListener() {
  server.on('tweets', function(data) {
    var tweet = JSON.parse(data);
    var normalizedCountry = normalizeName(tweet.place.country);
    if($("#" + normalizedCountry).length === 1) {
      insertTweet(tweet, normalizedCountry);
    }
  });
}

$(function(){
  submitListener();
  tweetListener();
});
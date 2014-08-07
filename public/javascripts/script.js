var server = io.connect('http://localhost:8080');
var countriesToShow = [];

$(function(){
  submitListener();
});

function insertTweet(tweet, country) {
  var $countryUl = $("#" + country + " ul");
  if  ($countryUl.children().length > 9) {
    $("#" + country +" li").last().remove();
  }
 $countryUl.prepend('<li>' + tweet.text + '</li>');
}

function normalizeName(name) {
  return name.split(" ").join("-");
}

function submitListener() {
  $("#submit").click(function(e) {
      var country = normalizeName($("#country").val());
      countriesToShow.push(country);
      console.log(countriesToShow);
      e.preventDefault();
  });
}

(function tweetListener() {
  server.on('tweets', function(data) {
    data = JSON.parse(data);
    var normalizedCountry = normalizeName(data.place.country);
    console.log(normalizedCountry);
    if(countriesToShow.indexOf(normalizedCountry) >= 0) {
      addNewCountry(data, normalizedCountry);
      insertTweet(data, normalizedCountry);
    }
  });
})()

function addNewCountry(data, country) {
  if($("#" + country).length === 0) {
    var newCountry = "<div id='" + country + "'>" + 
      "<h2>" + data.place.country + "</h2><ul></ul></div>"
    $(".tweet_country_holder").append(newCountry);
  }
}
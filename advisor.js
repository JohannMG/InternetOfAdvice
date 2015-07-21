
var Auth = require('./auth.js');
var Twit = require('twit');
var fs = require('fs'); 

var Twitter = new Twit(  Auth.twitterAuthJSON  );
var stream = Twitter.stream('statuses/filter', { track: 'should' });

var tweetCounts = 0 ;
var tweetFreq = 10;  

stream.on('tweet', function sendToRT(tweet) {
 
  if (tweet.text.charAt(0) !== "@" && (tweet.user.screen_name !== Auth.username) &&
      tweet.user.friends_count > 1999   && tweet.possibly_sensitive === false && 
      noneWords(tweet.text) && tweetCounts % tweetFreq === 0 )
  {
    retweetTweet(tweet);
  }
  tweetCounts++;
  
});

//stream overflow message
stream.on('limit', function (limitMessage) {
  console.log("!!!!!!! STREAM HITTING LIMIT !!!!!");
  console.log(limitMessage);
});

stream.on('warning', function (warning) {
 console.log("!!!!!!! STREAM RCVD WARNING !!!!!");
 console.log(warning); 
});

function noneWords(str) {
  var NEGmatches = [ 'rt' , 'pic.twitter', 't.co', 'follow me', 'Real_Liam_Payne', 'all1dcrew' ];
  var POSmatches = [ 'you should' ];
   
  if (str.substring(0,2) === "RT" ){
    return false;
  } 
  
  for (var i = 0; i < NEGmatches.length; i++) {
    if ( str.toLowerCase().indexOf(  NEGmatches[i]  ) > 0  ){
      console.log("---" + str + " " + NEGmatches[i]); 
      return false;
    }
  }
  
  var hasOnePosPhrase = false; 
  for (var i = 0; i < POSmatches.length; i++) {
    if ( str.toLowerCase().indexOf(  POSmatches[i] ) > 0 ) {
      hasOnePosPhrase = true; 
    }
    
  }
  
  return hasOnePosPhrase; 
}

function retweetTweet(tweet){

  var twitURL = "https://www.twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id_str; 
  
  var TO_tweet =  "YOU SHOULD" + tweet.text.substring(  tweet.text.toLowerCase().indexOf("should")+ 6  )  + ' '+ twitURL;
  
  Twitter.post( 'statuses/update', { status: TO_tweet }, function(err, data, response) {
    console.log(tweet.id + " " + tweet.text);
  });

//  console.log(tweet); 
}

var Auth = require('./auth.js');
var Twit = require('twit');
var fs = require('fs'); 

//make twitter, make stream
var Twitter = new Twit(  Auth.twitterAuthJSON  );
var stream = Twitter.stream('statuses/filter', { track: 'you should' });

//Twitter Limiting Vars
var tweetCounts = 0;
var tweetFreq = 10; 
var tweetPerHourLimit = 10; //tweets per hour 

//reset limit on 10 tweets per hour, every hour
var tweetLimitInterval = setInterval(function resetTweetLimit() {
  tweetCounts = 0; 
}, 3600000 ); 

//event fires on new streamed tweet
stream.on('tweet', function sendToRT(tweet) {
 
  if (  tweet.text.charAt(0) !== "@"  
        && tweet.user.screen_name !== Auth.username 
        && tweet.user.friends_count > 1999  
        && tweet.possibly_sensitive === false 
        && tweetCounts % tweetFreq === 0 
        && tweetCounts < tweetPerHourLimit 
        && noneWords(tweet.text)  
     )
  {
    retweetTweet(tweet);
      tweetCounts++;
  }
  else{ console.log('FALSE___  ' + tweet.text);  }
  
  
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

//verfy its something we want to tweet
function noneWords(str) {
  var NEGmatches = [ 'pic.twitter', 't.co', 'follow me', 'Real_Liam_Payne', 'all1dcrew', '1d' ];
  var POSmatch = 'you should';
   
  if (str.substring(0,2) === "RT" ){
    return false;
  }
  
  for (var i = 0; i < NEGmatches.length; i++) {
    if ( str.toLowerCase().indexOf(  NEGmatches[i]  ) > 0  ){
      console.log("---reject---" + str + " [reason:" + NEGmatches[i]) ; 
      return false;
    }
  }
  
  if ( str.toLowerCase().indexOf(POSmatch) > 0 ) {
    return true;
  }
  
  return false; 
}

//quotes original tweet, posts advice in original tweet
function retweetTweet(tweet){

  var twitURL = "https://www.twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id_str; 
  
  var TO_tweet =  "YOU SHOULD" + tweet.text.substring(  tweet.text.toLowerCase().indexOf("should")+ 6  )  + ' '+ twitURL;
  
  Twitter.post( 'statuses/update', { status: TO_tweet }, function(err, data, response) {
    console.log(tweet.id + " " + tweet.text);
    
    if (err){  console.log(err);  }
    
  });

}
// add modeule to SpongeBot for insulting yourself
SpongeBot.insults = function(message, public) {

  var request = require('request')

  // get a random Elizabethan insult
  request({
    url: 'http://quandyfactory.com/insult/json',
    method: 'GET'
  }, function(error, response, body) {
    // return the insult, publicly if desired
    message.respond(JSON.parse(body).insult, null, public)
  })

}

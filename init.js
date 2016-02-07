// create a new bot, and return it's listen method to respond to incoming messages
module.exports = function() {

  var sprintf = require('sprintf-js').sprintf

  return new SpongeBot()
    // respond politely to 'hello'
    .when(/^hello!?$/i, function(message) {
      message.respond(sprintf(
        "Hi there, %s!", message.user_name || "whoever you are"))
    })
    // echo back anything after 'echo'
    .when(/^echo (.+)$/i, function(message, match) {
      message.respond(match[1])
    })
    // laugh maniacally in the channel to annoy everyone
    .when(/annoy everyone$/, function(message, match) {
      message.respond(
        "Hahahahallalalalhahhaauuhuhaaalallawwwlalalalwlalalwllaa!",
        null, true)
    })
    .listen

}()

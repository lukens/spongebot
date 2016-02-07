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
    .when(/^annoy everyone$/i, function(message, match) {
      message.respond(
        "Hahahahallalalalhahhaauuhuhaaalallawwwlalalalwlalalwllaa!",
        null, true)
    })
    // provide insults when asked, in public if desired
    .when(/^insult me( publicly)?$/i, function(message, match) {
      SpongeBot.insults(message, !!match[1])
    })
    // show details of the requested github issue
    .when(/^show( (me|everyone))?( (.+))? (.+) (issue |#)(\d+)$/i, function(message, match) {
      SpongeBot.githubIssues.showIssue(
        message, match[4], match[5], match[7], match[2] === "everyone")
    })
    // help
    .when(/^help$/i, function(message) {
      message.respond(
        "*Help help:* `[I'm optional]` `(choose me|or me)` "
        + "`[choose me|or me|or neither]` `<put something here>`\n"
        + "\n"
        + "*Available commands:*\n"
        + "_Silliness:_\n"
        + "`/spongebot hello` - I politely reply\n"
        + "`/spongebot echo <some text>` - I say whatever you typed after 'echo'\n"
        + "`/spongebot insult me [publicly]` - I insult you (infront of everyone, if you choose)\n"
        + "\n"
        + "_Useful Stuff:_\n"
        + "`/spongebot show [me|everyone] [owner] <repo> (issue |#)<number>`"
        + " - I show you (or everyone) details of the github issue in the given repository\n"
        + "\n"
        + "(sorry, that's all for now)")
    })
    // return the listen method
    .listen

}()

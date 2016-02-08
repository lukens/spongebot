// SpongeBot Class, with methods for adding listeners and responding to incoming messages
function SpongeBot() {

  // Message Class, provides an abstraction around incoming messages and responding
  function Message(context, callback) {

    // shortcuts for generally useful data
    this.text = context.data.text || ""
    this.user_name = context.data.user_name

    // access to full context data
    this.data = context.data

    // method for responding to messages
    this.respond = function(response, attachments, public) {

      // to-do: only works for quick responses, need to use slack API for delayed response
      callback(null, {
        "text" : response,
        "attachments" : attachments,
        "response_type": public ? "in_channel" : "ephemeral"
      })

    }

  }

  // array to store listener objects
  var listeners = []

  // the 'when' method, for adding functions to call when messages match the given pattern
  this.when = function(pattern, callback) {
    listeners.push({ "pattern" : pattern, "callback" : callback })
    return this
  }

  // the listener method, which responds to incoming messages
  this.listen = function(context, callback) {

    // create a message object from the context and callback
    var message = new Message(context, callback);

    // find listeners that match the message, along with thei matches
    var matchedListeners = listeners.map(function(listener) {
      return {
        "pattern" : listener.pattern,
        "callback" : listener.callback,
        "match" : message.text.match(listener.pattern)
      }
    })
    // filter out listeners that didn't match (as match will be null)
    .filter(function(matchedListener) {
      return matchedListener.match
    })

    // if any listeners matched, invoke the first one that did
    if (matchedListeners.length > 0) {
      matchedListeners[0].callback(message, matchedListeners[0].match)
    }
    // otherwise respond "You what?"
    else {
      message.respond("You what?")
    }

  }

}

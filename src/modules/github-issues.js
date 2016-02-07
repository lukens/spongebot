// add modeule to SpongeBot for viewing github issues
SpongeBot.githubIssues = function() {

  var request = require('request')
  var sprintf = require('sprintf-js').sprintf

  // function for showing a single issue
  function showIssue(message, owner, repository, issue, public) {

    // get values from message data, if required
    var token = message.data.github_api_token
    var owner = owner || message.data.github_organisation

    // can't do anything without a token, so check we have one
    if (!token) {
      message.respond('I need a `github_api_token` to do that')
    }
    // can't do anything without an owner, so check we have one
    else if (!owner) {

      message.respond('You need to specify an owner or provide a `github_organisation`')

    }
    // all's good, let's call the github api to get the issue details
    else {

      // build the request url
      var url = sprintf(
        "https://api.github.com/repos/%s/%s/issues/%s?access_token=%s",
        owner, repository, issue, token)

      // fire off the request
      request({
        url: url,
        method: 'GET',
        // github is fussy about having a user agent
        headers: { "User-Agent": "node.js-requests"}
      }, function(error, response, body) {

        // something went wrong, send the error back
        if (error) {
          message.respond(error)
        }
        // 404 means the issue wasn't found
        else if (response.statusCode === 404) {
          message.respond("I couldnt find that issue, try another!")
        }
        // unknown error, send it back
        else if (response.statusCode !== 200) {
          message.respond("Ooops, something went wrong!", [{
            "text": body, "color": "f00"
          }])
        }
        // everything went well, send back the issue details
        else {

          // parse the response into json, for json details see:
          // https://developer.github.com/v3/issues/#get-a-single-issue
          var json = JSON.parse(body)

          // format the main test, to show respository, issue number, state, and assignee
          var text = sprintf(
            "*%s <%s|#%s>:* *%s*%s",
            repository, json.html_url, json.number, json.state,
            json.state === 'closed'
              ? ""
              : !json.assignee
                ? ", unassigned"
                : sprintf(", assigned to <%s|%s>", json.assignee.html_url, json.assignee.login))

          // if a milestone is set, we want to show it in bold, before any labels,
          // and linked to the milestone (bacticks are so it is highlighted as inline code)
          var milestone = !json.milestone ? "" : sprintf(
            "*`<%s|%s>`* ", json.milestone.html_url, json.milestone.title)

          // if there are any lables, show them (after the milestone, if there was one)
          var labels = json.labels.reduce(function(labels, label) {
            return labels + sprintf(
              "`<%s|%s>` ",
              label.url.replace("api", "www").replace("repos/", ""),
              label.name)
          }, milestone)

          // build two attachments, one to show the issue details,
          // one to show the milestone and labels (slack deals with empty strings)
          var attachments = [
            {
              "title": json.title,
              "fallback": json.body,
              "text": json.body,
              "author_name": json.user.login,
              "author_link": json.user.url,
              "author_icon": json.user.avatar_url,
              "mrkdwn_in": ["text"], // enable markdown
              // set the colour to the colour of the first label
              "color": !!json.labels.length ? json.labels[0].color : "ccc"
            },
            {
              "pretext": labels,
              "fallback": labels,
              "mrkdwn_in": ["pretext"], // enable markdown
            }
          ]

          // send the text we built as the response text, along with attachments
          // send it as public if that was desired
          message.respond(text, attachments, public)

        }

      })

    }

  }

  // expose public methods
  return {
    showIssue: showIssue
  }

}()

var gulp = require('gulp')
var util = require('gulp-util')
var fs = require('fs')
var through = require('through2')
var request = require('request')
var sprintf = require('sprintf-js').sprintf

// list of src files to concatinate. init.js should come last
var srcs = ['src/**/*.js', 'init.js']

// default build task concatinates the required src files together
gulp.task('default', function() {

  var concat = require('gulp-concat')

  // concatinate the files, and store in dist
  return gulp.src(srcs)
    .pipe(concat('spongebot-webtask.js'))
    .pipe(gulp.dest('dist'))

})

gulp.task('deploy:full', ['deploy:gist', 'gen:url'])

// task to deploy the script as a gist.
// tracks the gist details in .gist.json, so the url can be used,
// and the existing gist can be updated.
// requires $GITHUB_API_TOKEN to deploy the gist
gulp.task('deploy:gist', ['default'], function() {

  var File = require('vinyl')
  var uglify = require('gulp-uglify')

  // load the concatinated file
  return gulp.src('dist/spongebot-webtask.js')
    // minify using uglify
    .pipe(uglify())
    // deploy as a gist
    .pipe(through.obj(function(file, enc, callback) {

      // ensure we have a git hub api token
      var token = process.env.GITHUB_API_TOKEN
      if (!token) {
        return callback(
          "Github access token $GITHUB_API_TOKEN is required")
      }

      // try loading the gist details, if already created
      try {
        // load
        var gist = JSON.parse(fs.readFileSync('.gist.json', 'utf8'))
        // log
        util.log("Existing gist found: " + gist.id + ":")
        util.log("  " + gist.url)
      } catch (error) {
        // ignore file exists error, bail on other errors
        if (error.code !== 'ENOENT') {
          return callback(error)
        }
      }

      // if we have gist details, this is an update
      var update = !!gist

      // send the api request to github
      request({
        // if we already have a gist, we need to include the id to update it
        url: sprintf(
          'https://api.github.com/gists%s?access_token=%s',
          update ? '/' + gist.id : "", token),
        // update requires a PATCH new is POST
        method: update ? 'PATCH' : 'POST',
        headers: { "User-Agent": "node.js-requests"},
        // request body
        json: {
          "description" : "spongebot webtask",
          "files" : {
            "spongebot-webtask.min.js" : {
              "content" : file.contents.toString()
            }
          }
        }
      }, function(error, response, body) {

        // something went wrong :(
        if (error || response.statusCode < 200 || response.statusCode > 201) {
          callback(error || "Error: Status code = " + response.statusCode)
        }
        // all good :)
        else {

          // store/update the gist details
          gist = {
            "id" : body.id,
            "url" : body.files["spongebot-webtask.min.js"].raw_url
          }

          // log the id and url
          util.log(sprintf("%s gist: %s:", update ? "Updated" : "Created", gist.id))
          util.log("  " + gist.url)

          // create a File object with the new/updated details
          var gist_file = new File({
            "path" : ".gist.json",
            "contents" : new Buffer(JSON.stringify(gist))
          })

          // send the file on down the pipe
          callback(null, gist_file)

        }

      })

    }))
    // save the .gist.json file to the working dir
    .pipe(gulp.dest('.'))

})

// task to generate a webtask URL with signed token
// requires deploy:gist to be run first, but doesn't depend
// on it as that can cause it to create too many updates
// uses the 'default' webtask profile, by default, can be overriden
// by setting environment variable $WEBTASK_PROFILE
gulp.task('gen:url', function() {

  var YAML = require('yamljs')
  var exec = require('child_process').exec

  // start with the .gist.json file, as we need that
  return gulp.src(".gist.json")
    .pipe(through.obj(function(file, enc, callback) {

      // load the gist and profile details into objects
      var gist = JSON.parse(file.contents.toString())

      // use specified profile, or 'default', and log usage
      var profile = process.env.WEBTASK_PROFILE || 'default'
      util.log("Using webtask profile: " + profile + " [$WEBTASK_PROFILE to change]")

      // use specified name, or 'spongebot', and log usage
      var name = process.env.WEBTASK_NAME || 'spongebot'
      util.log("Using webtask name: " + name + " [$WEBTASK_NAME to change]")

      // try loading additional token data from a file token-data.json
      try {

        var data = JSON.parse(fs.readFileSync('token-data.json', 'utf8'))

        var secrets = ""
        for (var key in data) {
          if (data.hasOwnProperty(key)) {
            secrets += sprintf(" -s %s='%s'", key, data[key])
          }
        }

      } catch (error) {
        // ignore file exists error, bail on other errors
        if (error.code !== 'ENOENT') {
          return callback(error)
        }
      }

      // call the wt cli to create the token url
      exec(sprintf(
        'wt create -n %s -p %s -o token-url %s %s ', name, profile, secrets || "", gist.url),
        function(error, stdout, stderror) {

        // something went wrong :(
        if (error || stderror) {
          callback(error || stderror)
        }
        // all good :)
        else {

          // log a curl command to test it out
          util.log("Give it a go:")
          console.log(sprintf(
            "curl -X POST -H 'Content-Type: application/json' -d '{\"text\":\"hello\"}' '%s'",
            stdout.replace(/\n/g, "")))

          // all done!
          callback()

        }

      })

    }))

})

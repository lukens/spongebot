# spongebot
SpongeBot is a very simple ChatBot designed to be trigged via a
Slack slash-command, executed on [webtask.io](https://webtask.io),
and hosted as a private [Gist](https://gist.github.com).

Designed to be easily extensible, and very _very_ loosely based
on [Hubot](https://hubot.github.com).

## Very Basic Instructions

### Prerequisites

Before using SpongeBot, you will need a [Slack](https://slack.com) account and a
[Webtask](https://webtask.io) account.

You will also need to have installed and initialised
the [webtask.io command line interface](https://webtask.io/cli).

For some functionality, you will also need a [github account](https://github.com) and
[api access token](https://github.com/settings/tokens). For full build functionality to work,
you will need to grant it `gist` priviledges.

For the build, you will need [Node](https://nodejs.org/en/) and npm.

A local clone of this repository.

Full instructions on setting all of that up is beyond the scope of this read me
(aka - you're on your own).

### Installation

The simplest installation is the one I will discuss.

1. install node packages
2. set an environment variable for your github token
3. run the full deployment
4. run the curl command output
5. copy-and-paste the url from the curl command into the url field for your
[slash command on Slack](https://api.slack.com/slash-commands)

All in all, that'll look something like:

```bash
> npm install
> export $GITHUB_API_TOKEN=<your api token here>
> gulp deploy:full
> <the curl command it said to try>
```

### Usage

Once you have set up the Slack command, type "/spongebot help" for instructions
(assuming you have set you slash command up to be called "spongebot" (and why wouldn't you?)).

Example commands:

```
/spongebot hello
/spongebot insult me
/spongebot show everyone some-org some-repo issue 123
```

### Extra stuff

You can modify commands in `init.js`

For some functionality (github issues) you need to
[pass extra data in the token that webtask generates](https://webtask.io/docs/token).
To do so, create a file call `token-data.json` in your project root, and set it up like this
(properties will be sent through as secret/`ectx` data):

```json
{
  "github_api_token" : "<your api token>",
  "github_organisation" : "<your github organisation, or user>"
}
```

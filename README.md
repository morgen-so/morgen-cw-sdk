Morgen Assist – Custom Workflow SDK
===================================

A CLI + helpers to make it easier to build, test and deploy custom workflows to the Morgen Assist platform.

:warning: This is an experimental library, breaking changes likely.

# Installation

```
$ npm install morgen-cw-sdk
```

# Requirements
Morgen Assist account → [https://platform.morgen.so](https://platform.morgen.so)

Make sure to add at least one calendar integration, to enable use-cases where the workflow inserts or modifies events on your calendar.

# Basic Usage
To use the SDK, first you’ll need to configure your environment in order to connect to the Morgen APIs. To do this, set one of the following:


```
MORGEN_API_KEY = 'ApiKey-.....'
MORGEN_ACCESS_TOKEN = '...'
```

Now you can provide a TypeScript function that will run in our V8 isolate environment. For now, you can copy an example to go through the flow of testing and deploying your script.

```
// basic_example.ts

import cw, { morgen } from "morgen-cw-sdk";
const { log } = morgen.util;

cw.workflow(
  {
    name: "basic_example",
  },
  async function run(trigger) {
    log('testing');
  }
).run({
  httpParams: { },
  eventUpdates: { added: [], updated: [], removed: [] },
  user: {
    email: "...",
    firstName: "...",
  },
  accounts: {
    calendar: [],
  },
})
```

Now we can compile + run this:


```
$ tsc basic_example.ts
$ node basic_example.js

...
testing
...
```

The above workflow ran live on Morgen’s server and the output and result was returned to the terminal.

__:warning: NOTE: Controlling triggers is on the roadmap but is not currently
supported.__

If you want your script to run every hour, you can provide extra triggers in the triggers array. See more details for how to configure your workflow here: [CW Docs](https://cw-docs.morgen.so/).

```
// example_basic.ts

import cw, { morgen } from "morgen-cw-sdk";
const { fetchMorgen, log } = morgen.util;

cw.workflow(
  {
    name: "example_basic",
    //
    // NOTE: Not currently supported! (Support coming soon!)
    //
    triggers: [
      {
        "configurable": false,
        "type": "cron",
        "config": {
          // Run every hour
          "schedule": "0 * * * *"
        }
      }
    ],
  },
  async function run(trigger) {
    log('testing');
  }
)
```

To test changes to your script, try editing it and running it again. The changes should be reflected.

Now that you've run the workflow, it will be visible in your account under [“My Workflows”](https://platform.morgen.so/workflows).

You can also edit the parameters of the workflow from the Morgen Assist web app, like the trigger, but note: these will be overridden when you next run from your machine.

# Inserting an event into your calendar
This next example requires you to set a calendar on the custom workflow under [“Accounts”](https://platform.morgen.so/integrations/connected). Head to the workflow settings page in the web app to add one.

Then, try updating the example by making it insert an event the first calendar:

```
// example_create_event.ts

import cw, { morgen } from "morgen-cw-sdk";

const { fetchMorgen, log } = morgen.util;
const { luxon } = morgen.deps;

cw.workflow(
  {
    name: "example_create_event"
  },
  async function run(trigger) {
    const { DateTime } = luxon;

    if (!trigger.accounts?.calendar?.[0]?.calendarId)
      throw new Error("No calendar configured!");

    // Use the first calendar ID specified
    const calId = trigger.accounts.calendar[0].calendarId;

    // Create valid start time using the luxon library
    const start = DateTime
      .now()
      .toUTC()
      .startOf('minute')
      .toISO({includeOffset: false, suppressMilliseconds: true});
    const timeZone = DateTime.now()._zone.name;

    // Add an event to the user's calendar
    const resp = await fetchMorgen("https://sync.morgen.so/v1/events/create", {
      method: 'POST',
      body: JSON.stringify({
        calendarId: calId,
        start,
        timeZone,
        duration: "PT5M",
        showWithoutTime: false,
      })
    })
    log(resp);

    log('Example workflow complete! 🎉');
  }
)

cw.upload();
```

You might find that the workflow fails due to the calendar not being specified.
You can specify a calendar in the workflow settings page in the app.

# Advanced Usage

You’ll probably want to write more interesting scripts to see some of the more
advanced capabilities of custom workflows. There are plenty of examples to
choose from in the [./examples](./examples) directory in the SDK itself.

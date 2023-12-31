Morgen Custom Worfklow SDK
==========================

Automate virtually any calendar provider through a single interface, deploy your custom workflows to our cloud service with minimal effort.

:warning: This is an experimental library, breaking changes likely.

# Requirements
 - Morgen account → [https://platform.morgen.so](https://platform.morgen.so)
 - At least one calendar integration to insert or modify events → See [“Accounts”](https://platform.morgen.so/integrations/connected)

# Installation

```
$ cd my-morgen-workflows
$ npm init
$ npm install -g typescript ts-node
$ npm install git+https://github.com/morgen-so/morgen-cw-sdk
```

# Basic Usage
To use the SDK you’ll first need to configure your environment in order to connect to the Morgen APIs. To do this, set one of the following:


```
// NOTE: Only requests to `https://api.morgen.so` support API_KEY
export MORGEN_API_KEY='xGsJrvSh...'
export MORGEN_ACCESS_TOKEN='xogjF4hksS...'
```

Now you can provide a TypeScript function that will run in our V8 isolate environment. For now, you can copy an example to go through the flow of testing and deploying your script.

```ts
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
  eventUpdates: { added: [], modified: [], removed: [] },
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
$ ts-node basic_example.ts

...
testing
...
```

The above workflow ran locally and the output and result was returned to the terminal.

To trigger the workflow on Morgen's server, there are two options:
 - Call `.trigger()` on the workflow object in the script
   - Note: There currently is no way to pass `httpParams` this way
 - Call the HTTP endpoint that is provided after the workflow is uploaded (and
   which stays the same for the lifetime of the workflow)
   - This enables setting `httpParams` in the `trigger` object, by passing
     either query parameters in a GET request or a JSON body in a POST request.

To test changes to your script, try editing it and running it again. The changes should be reflected.

Now that you've run the workflow, it will be visible in your account under [“My Workflows”](https://platform.morgen.so/workflows).

You can also edit the parameters of the workflow from the Morgen platform web app, like the trigger, but note: these will be overridden when you next run from your machine.

# Inserting an event into your calendar
This next example requires you to set a calendar on the custom workflow under [“Accounts”](https://platform.morgen.so/integrations/connected). Head to the workflow settings page in the web app to add one.

Then, try updating the example by making it insert an event the first calendar:

```ts
// example_create_event.ts

import cw, { morgen } from "morgen-cw-sdk";

const { fetchMorgen, log } = morgen.util;
const { luxon } = morgen.deps;

const wf = cw.workflow(
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
    const timeZone = DateTime.now().zoneName || 'UTC';

    // Add an event to the user's calendar
    const resp = await fetchMorgen("https://sync.morgen.so/v1/events/create", {
      method: 'POST',
      body: JSON.stringify({
        title: "A new event!",
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

wf.upload();
```

You might find that the workflow fails due to the calendar not being specified.
You can specify a calendar in the workflow settings page in the app.

# User Provided Utilities

You can provide your own utility functions to use in your workflow.  These can
be functions, classes or data objects you or others write.  They need to be self
contained and not rely on any external dependencies.  Here are a number of
examples:

## Defining a function outside of the workflow

```ts
// example_inline_utility.ts

// Define a function outside of the workflow that can be used inside the workflow

import cw, { morgen } from "morgen-cw-sdk";

const { log } = morgen.util;

function testFunction() {
  log("testFunction called!");
}

class TestClass {
  constructor() {
    log("TestClass constructor called!");
  }
}

const wf = cw.workflow(
  {
    name: "example_inline_utility"
  },
  async function run(trigger) {
    testFunction();
    const tc = new TestClass();
  }
)

wf.upload(options: {
  userUtilities: [testFunction, TestClass]
});
```

## Importing variables from another module

```ts
// accounts-calendars.ts

export const accounts = {
  "email.address@example.com": {
    id: "account-id"
    calendars: {
      "Primary": "primary-calendar-id",
      "Other": "other-calendar-id"
    }
  },
  "another.email@example.com": {
    id: "another-account-id",
    calendars: {
      "Primary": "primary-calendar-id-another-account",
      "Other": "other-calendar-id-another-account"
    }
  }
}

// accounts-default.ts

export default {
  "email.address@example.com": {
    id: "account-id"
    calendars: {
      "Primary": "primary-calendar-id",
      "Other": "other-calendar-id"
    }
  },
  "another.email@example.com": {
    id: "another-account-id",
    calendars: {
      "Primary": "primary-calendar-id-another-account",
      "Other": "other-calendar-id-another-account"
    }
  }
}


// example_import_variable_from_module.ts

// If you want to include an object, or variable from another module, you can
// it will need to be done differently than a function or class

import cw, { morgen } from "morgen-cw-sdk";

const { log } = morgen.util;

import { accounts } from "./accounts-calendars";

// If it is a default export you need to handle a little different
import accountsDefault from "./accounts-default"

const wf = cw.workflow(
  {
    name: "example_import_variable_from_module"
  },
  async function run(trigger) {
    log("morgen", accounts);
  }
)

wf.upload(options: {
  userUtilities: [
    // Import name is the final part of the module path.  If there are multiple
    // modules with the same final part, it will break.
    // eg:
    //    import { accounts } from "./accounts-calendars";
    //        would have import_name: "accounts-calendars"
    //    import { accounts } from "./accounts/my-accounts";
    //        would have import_name: "my-accounts"
    //    import { accounts } from "./helpers/accounts/personal";
    //        would have import_name: "personal"
    {name: "accounts", value: accounts, import_name: "account-calendars"}
    {name: "accountsDefault", value: accountsDefault, import_name: "accounts-default", default: true}
  ]
});
```

## Import a function or class from another module

```ts
// myModule.ts

import { morgen } from "morgen-cw-sdk";
const { log } = morgen.util;

export function myFunction() {
  return log("myFunction called!");
}

// example_import_from_module.ts

// Import a function or class from another module that has a different name
// from the function or class itself

import { myFunction } from "./myModule";

import cw, { morgen } from "morgen-cw-sdk";

const { fetchMorgen, log } = morgen.util;
const { luxon } = morgen.deps;

const wf = cw.workflow(
  {
    name: "example_create_event"
  },
  async function run(trigger) {
    const value = myFunction();
  }
)

wf.upload(options: {
  userUtilities: [
    {
      import_name: "myModule",
      value: myFunction
    }
  ]
});
```

# Advanced Usage

You’ll probably want to write more interesting scripts to see some of the more
advanced capabilities of custom workflows. There are plenty of examples to
choose from in the [./examples](./examples) directory in the SDK itself.

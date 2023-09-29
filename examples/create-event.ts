// import cw, { morgen } from "morgen-cw-sdk";
import cw, { sandbox } from "../src";

const { morgen } = sandbox.util;
const { luxon } = sandbox.deps;

/**
 * This is a basic example of a workflow that creates a new event in the
 * provided calendar.
 *
 * NOTE: Please specify the calendar in the UI once the workflow has been
 * uploaded.
 */
const wf = cw.workflow(
  {
    name: "SDK Example: Create an Event",
  },
  async function run(trigger) {
    if (!trigger.accounts?.calendar?.[0]?.calendarId)
      throw new Error("No calendar configured!");
    const { accountId, calendarId } = trigger.accounts.calendar[0];

    // Get exported classes of the luxon library
    const { DateTime, Duration } = luxon;

    // Create the start time using the luxon library
    const startDT = DateTime.now().startOf("minute");
    const start = startDT.toISO({
      // Milliseconds aren't supported by the Morgen API
      suppressMilliseconds: true,
      // Exclude the time zone, which is provided separately
      includeOffset: false,
    })!;
    const timeZone = startDT.zoneName || "UTC";

    // Create the duration
    const duration = Duration.fromObject({ minutes: 30 }).toISO()!;

    // Set this property to:
    //   - true to show it as an all-day event
    //   - false to show it at a specific time of day.
    const showWithoutTime = false;

    // Perform the request using our client
    const resp = await morgen().events.createEventV3({
      requestBody: {
        calendarId,
        accountId,
        title: "Get started with TimeTo! 🥳",
        description:
          "Congratulations, you just added an event to your calendar through the power of Morgen! 👏",
        timeZone,
        showWithoutTime,
        start,
        duration,
      },
    });
    return resp;
  }
);

// Upload the workflow, and trigger it when upload is complete
wf.upload().then(() => wf.trigger());

/*
wf.run({
  httpParams: {},
  eventUpdates: {
    added: [],
    modified: [],
    removed: [],
  },
  user: {
    email: "",
    firstName: "",
  },
  accounts: {
    calendar: [
      {
        accountId: "6441683859cf95c5a82dd83a",
        calendarId:
          "WyI2NDQxNjgzODU5Y2Y5NWM1YTgyZGQ4M2EiLCJkODQzNjAzOTljZDdlMTkyNmJjOWEyZTljYjliNWUzYzViMmViMDI5ZTMzZWI1M2FlNTQ3ODg1MDg5YTNhM2ZjQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20iXQ",
      },
    ],
  },
});
*/

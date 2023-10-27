// import cw, { morgen } from "morgen-cw-sdk";
import cw, { sandbox } from "../src";

const { morgen, log } = sandbox.util;
const { luxon } = sandbox.deps;

/**
 * This example will list events for tomorrow for a configured calendar.
 */
const wf = cw.workflow(
  {
    name: "SDK Example: List tomorrow's events",
  },
  async function run(trigger) {
    if (!trigger.accounts?.calendar?.[0])
      throw new Error("Please configure a calendar");
    const { accountId, calendarId } = trigger.accounts.calendar[0];

    // Create start/end timerange
    const start = luxon.DateTime.now();
    const startTs =
      start
        .startOf("day")
        .plus({ days: 1 })
        .toISO({ includeOffset: false, suppressMilliseconds: true }) || "";
    const endTs =
      start
        .startOf("day")
        .plus({ days: 2 })
        .toISO({ includeOffset: false, suppressMilliseconds: true }) || "";

    // Fetch events from the Morgen API
    const eventResp = await morgen().events.listEventsV3({
      accountId,
      calendarIds: calendarId,
      start: startTs,
      end: endTs,
    });

    log(JSON.stringify(eventResp, null, 2));
  }
);

// Upload the workflow, and trigger it when upload is complete
wf.upload().then(() => wf.trigger());

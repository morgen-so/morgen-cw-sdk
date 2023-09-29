// import cw, { morgen } from "morgen-cw-sdk";
import cw, { sandbox } from "../src";

const { morgen } = sandbox.util;
const { luxon } = sandbox.deps;

/**
 * This example will create Morgen task and schedule for the current time.
 *
 * NOTE: Please specify the calendar in the UI once the workflow has been
 * uploaded.
 */
const wf = cw.workflow(
  {
    name: "SDK Example: Schedule a Task",
  },
  async function run(trigger) {
    if (!trigger.accounts?.calendar?.[0]?.calendarId)
      throw new Error("No calendar configured!");
    const { accountId, calendarId } = trigger.accounts.calendar[0];

    // Get exported classes of the luxon library
    const { DateTime, Duration } = luxon;

    // Create the start time using the luxon library
    const startDT = DateTime.now().startOf("minute");

    const title = "Auto-scheduled task 001";
    const estimatedDuration = Duration.fromObject({ minutes: 30 }).toISO()!;

    const taskResp = await morgen().tasks.createTaskV2({
      requestBody: {
        title,
        estimatedDuration,
      },
    });

    // Perform the request using our client
    const resp = await morgen().events.createEventV3({
      requestBody: {
        "morgen.so:metadata": {
          taskId: taskResp.id.split("@")[0],
        },
        calendarId,
        accountId,
        title,
        description:
          "A task that I need to have automatically scheduled right now.",
        timeZone: startDT.zoneName || "UTC",
        showWithoutTime: false,
        start: startDT.toISO({
          // Milliseconds aren't supported by the Morgen API
          suppressMilliseconds: true,
          // Exclude the time zone, which is provided separately
          includeOffset: false,
        })!,
        duration: estimatedDuration,
      },
    });
    return resp;
  }
);

// Upload the workflow, and trigger it when upload is complete
wf.upload().then(() => wf.trigger());

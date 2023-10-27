// import cw, { morgen } from "morgen-cw-sdk";
import cw, { sandbox } from "../src";

const { morgen, log } = sandbox.util;
const { luxon } = sandbox.deps;

/**
 * This example will find a 3rd party task and schedule for the current time.
 *
 * NOTE: Please specify the calendar in the UI once the workflow has been
 * uploaded.
 */
const wf = cw.workflow(
  {
    name: "SDK Example: Schedule a 3rd-party Task",
  },
  async function run(trigger) {
    if (!trigger.accounts?.calendar?.[0]?.calendarId)
      throw new Error("No calendar configured!");
    const { accountId, calendarId } = trigger.accounts.calendar[0];

    // Get exported classes of the luxon library
    const { DateTime } = luxon;

    const integs = await morgen().accounts.listAccountsV3();

    const serviceName = "todoist"; // One of googleTasks, microsoftToDo, microsoftOutlook, todoist
    const taskAccountId = integs.data?.accounts?.find(
      (integ) => integ.integrationId === serviceName
    )?.providerId;

    if (!taskAccountId) {
      throw new Error("User has not connected this type of account");
    }

    const taskResp = await morgen().tasks.listTasksV2({
      accountId: taskAccountId,
      serviceName,
    });

    if (taskResp.length < 1) throw new Error("No tasks found");
    log(taskResp.length + " tasks found");

    // Choose the first task as a demonstration
    const t = taskResp[0];

    // Construct the correctly formatted metadata ID
    const taskId = [t.serviceName, t.accountId, t.accountId, t.id].join("---");

    // Schedule the task event to begin now
    const now = DateTime.now();

    const resp = await morgen().events.createEventV3({
      requestBody: {
        // Link the event back to the third-party task so that it appears linked in Morgen
        "morgen.so:metadata": {
          taskId,
        },
        calendarId,
        accountId,
        title: t.title,
        description: t.description,
        timeZone: now.zoneName || "UTC",
        showWithoutTime: false,
        start: now.toISO({
          // Milliseconds aren't supported by the Morgen API
          suppressMilliseconds: true,
          // Exclude the time zone, which is provided separately
          includeOffset: false,
        })!,
        duration: t.estimatedDuration || "PT30M",
      },
    });
    log(JSON.stringify(resp));
    return resp;
  }
);

// Upload the workflow, and trigger it when upload is complete
wf.upload().then(() => wf.trigger());

// import cw, { morgen } from "morgen-cw-sdk";
import cw, { sandbox } from "../src";

const { morgen, log } = sandbox.util;

/**
 * This example will list tasks for a provided type of task integration.
 */
const wf = cw.workflow(
  {
    name: "SDK Example: List all tasks",
  },
  async function run() {
    const integs = await morgen().accounts.listAccountsV3();

    const serviceName = "todoist"; // One of googleTasks, microsoftToDo, microsoftOutlook, todoist

    const accountId = integs.data?.accounts?.find(
      (integ) => integ.integrationId === serviceName
    )?.providerId;

    if (!accountId) {
      throw new Error("User has not connected this type of account");
    }

    const taskResp = await morgen().tasks.listTasksV2({
      accountId,
      showCompleted: true,
      updatedAfter: "2023-10-24T00:00:00Z",
      serviceName,
    });

    log(JSON.stringify(taskResp, null, 2));

    return taskResp;
  }
);

// Upload the workflow, and trigger it when upload is complete
wf.upload().then(() => wf.trigger());

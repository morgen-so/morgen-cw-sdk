import * as util from "./global";
import * as luxon from "luxon";
import { WorkflowConfig, WorkflowFunction, WorkflowTrigger } from "./types";

/**
 * An object representing a Morgen Workflow, that can be uploaded to the server
 * and run/triggered remotely or run locally.
 *
 * Test locally:
 *  await workflow.run()
 *
 * Trigger remotely:
 *  await workflow.upload()
 *  await workflow.trigger()
 */
class Workflow<T> {
  config: WorkflowConfig;
  fn: WorkflowFunction<T>;
  id?: string;

  constructor(config: WorkflowConfig, fn: WorkflowFunction<T>) {
    this.config = config;
    this.fn = fn;

    const { MORGEN_API_KEY, MORGEN_ACCESS_TOKEN } = process.env;
    if (!MORGEN_API_KEY && !MORGEN_ACCESS_TOKEN) {
      throw new Error(
        "Invalid env: please set either MORGEN_API_KEY or MORGEN_ACCESS_TOKEN"
      );
    }
  }

  /**
   * Run this workflow locally, as if it were triggered.
   */
  async run(trigger: WorkflowTrigger) {
    return this.fn(trigger);
  }

  /**
   * Trigger this workflow remotely via the Morgen API. The workflow MUST have
   * been uploaded before calling this method.
   * NOTE: It's currently not possible to pass trigger parameters through this
   * method. Use the trigger URL to pass parameters.
   */
  async trigger() {
    // TODO: Parameters can't get passed to the trigger function here (yet)
    const resp = util.fetchMorgen("https://api.morgen.so/workflows/execute", {
      method: "POST",
      body: JSON.stringify({ id: this.id }),
    });
    console.info("Workflow triggered...");
    resp.then(async (resp) => {
      console.info("Workflow complete. " + this.id);
      const { result } = resp;
      result.logs.forEach((l: { ts: number; log: string[] }) => {
        console.info(`${l.ts}: ${l.log}`);
      });
      if (result?.result?.error) {
        console.info(result.result.error);
        console.info(result.result.stack);
      }
    });
  }

  /**
   * Upload this workflow to the platform (user script only). The name of the
   * workflow is used to determine whether to update an existing workflow, or
   * create a new one.
   *
   * NOTE: The uploaded workflow cannot currently be configured here (apart
   * from the name). See the platform UI for configuration of accounts.
   */
  async upload() {
    const fnString = this.fn.toString();
    const userScript = [util.fetchMorgen.toString()].join() + ";\n" + fnString;

    // Find a workflow with the same name
    const resp = await util.fetchMorgen("https://api.morgen.so/workflows/list");
    const workflows = resp as any[];
    if (resp.error) throw resp.error;
    const existing = workflows.find((wf) => wf.name === this.config.name);

    if (existing) {
      console.info("Updating existing workflow");
      const resp = await util.fetchMorgen(
        "https://api.morgen.so/workflows/update",
        {
          method: "POST",
          body: JSON.stringify({
            ...existing,
            config: {
              ...existing.config,
              userScript,
            },
          }),
        }
      );
      const workflowObj = resp;
      this.id = workflowObj.id;
      console.info("Workflow updated!");
      console.info(
        "Trigger URL: https://api.morgen.so/workflows/run/" +
          workflowObj.triggerId
      );
    } else {
      console.info("Uploading new workflow");
      const resp = await util.fetchMorgen(
        "https://api.morgen.so/workflows/create",
        {
          method: "POST",
          body: JSON.stringify({
            active: true,
            workflowId: "custom-workflow",
            triggers: [
              {
                type: "manual",
              },
              {
                type: "http",
              },
              // TODO: Enable other triggers
            ],
            config: {
              userScript,
            },
            name: this.config.name,
          }),
        }
      );
      const workflowObj = resp;
      this.id = workflowObj.id;
      console.info("Workflow created!");
      console.info(
        "Trigger URL: https://api.morgen.so/workflows/run/" +
          workflowObj.triggerId
      );
      console.info("Workflow uploaded.");
    }
  }
}

/**
 * Create a new Workflow to be uploaded or for local testing.
 */
function workflow<T>(config: WorkflowConfig, fn: WorkflowFunction<T>) {
  return new Workflow(config, fn);
}
export default {
  workflow,
};

export const morgen = {
  util,
  deps: {
    luxon,
  },
};

import * as util from "./global";
import * as luxon from "luxon";
import {
  WorkflowConfig,
  WorkflowFunction,
  WorkflowResult,
  WorkflowTrigger,
} from "./types";

import { request } from "./generated/core/request";
import { Morgen } from "./generated/Morgen";
import { EventsService } from "./generated/services/EventsService";
import { FetchHttpRequest } from "./generated/core/FetchHttpRequest";
import { BaseHttpRequest } from "./generated/core/BaseHttpRequest";
import { CancelablePromise } from "./generated/core/CancelablePromise";
import { AccountsService } from "./generated/services/AccountsService";
import { UserService } from "./generated/services/UserService";
import { CalendarsService } from "./generated/services/CalendarsService";
import { TasksService } from "./generated/services/TasksService";
import { TaskListsService } from "./generated/services/TaskListsService";
import { AvailabilityService } from "./generated/services/AvailabilityService";

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
  async trigger(): Promise<WorkflowResult> {
    // TODO: Parameters can't get passed to the trigger function here (yet)
    const resp = util.fetchMorgen("https://api.morgen.so/workflows/execute", {
      method: "POST",
      body: JSON.stringify({ id: this.id }),
    });
    console.info("Workflow triggered...");
    return resp.then(async (resp) => {
      console.info("Workflow complete. " + this.id);
      const { result } = resp.body;
      result.logs.forEach((l: { ts: number; log: string[] }) => {
        console.info(`${l.ts}: ${l.log}`);
      });
      if (result?.result?.error) {
        console.info(result.result.error);
        console.info(result.result.stack);
      }
      return result;
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

    let userScript =
      [
        // Include generated utility functions for making requests
        CancelablePromise.toString(),
        BaseHttpRequest.toString(),
        // Include non-generated request.ts, including a customised request
        // function for processing requests and responses. This is supported by
        // openapi-typescript-codegen through the --request option.
        request.toString(),
        FetchHttpRequest.toString(),
        util.fetchMorgen.toString(),
        Morgen.toString(),
        util.morgen.toString(),
        // Include generated service classes encapsulating the Morgen backend API
        AccountsService.toString(),
        CalendarsService.toString(),
        EventsService.toString(),
        AvailabilityService.toString(),
        TaskListsService.toString(),
        TasksService.toString(),
        UserService.toString(),
      ].join(";\n") +
      ";\n" +
      fnString;

    // TypeScript compiles these as "[Symbol]_1.[Symbol]" to disambiguate but
    // above they are made available in the global scope, so modify the code to
    // correctly resolve them.
    const modules = [
      "CancelablePromise",
      "BaseHttpRequest",
      "FetchHttpRequest",
      "request",
      "log",
      "morgen",
      "Morgen",
      "EventsService",
      "AvailabilityService",
      "AccountsService",
      "CalendarsService",
      "TasksService",
      "TaskListsService",
      "UserService",
    ];
    modules.forEach((m: string) => {
      userScript = userScript.replaceAll(`${m}_1.${m}`, m);
    });

    // Anything in global_1 = something available globally
    //   e.g. global_1.fetchJSON
    //        global_1.log
    userScript = userScript.replaceAll("global_1.", "");

    // Print the final user script to the console for easier debugging when
    // errors occur.
    console.info("Uploading user script");
    console.info(
      userScript
        .split("\n")
        .map((l, ix) => ix + 1 + ": " + l)
        .join("\n")
    );
    // Find a workflow with the same name
    const resp = await util.fetchMorgen("https://api.morgen.so/workflows/list");
    const workflows = resp.body as any[];
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
      const workflowObj = resp.body;
      this.id = workflowObj.id;
      console.info("Workflow updated!");
      console.info(
        "Trigger URL: https://api.morgen.so/workflows/run/" +
          workflowObj.triggerId
      );
      console.info(
        "Config URL: https://platform.morgen.so/workflows/custom-workflow/" +
          this.id
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
      const workflowObj = resp.body;
      this.id = workflowObj.id;
      console.info("Workflow created!");
      console.info(
        "Trigger URL: https://api.morgen.so/workflows/run/" +
          workflowObj.triggerId
      );
      console.info(
        "Config URL: https://platform.morgen.so/workflows/custom-workflow/" +
          this.id
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

export const sandbox = {
  util,
  deps: {
    luxon,
  },
};

import { describe } from "node:test";

const mockConsoleLog = jest.fn(console.log);
// This next line needs to happen before importing the log function because the
// `log` function is assigned in the module.
global.console.log = mockConsoleLog;

const mockFetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ test: "success" }),
    text: () => Promise.resolve("plaintext result"),
  })
);
global.fetch = mockFetch as unknown as typeof global.fetch;

import cw, { morgen } from "..";
import { WorkflowTrigger } from "../dist/types";

const { log, fetch } = morgen.util;

const BASIC_TRIGGER: WorkflowTrigger = {
  httpParams: {},
  eventUpdates: { added: [], removed: [], updated: [] },
  accounts: { calendar: [] },
  user: { email: "", firstName: "" },
};

describe("Workflow", () => {
  describe("Local script running", () => {
    beforeEach(() => {
      mockConsoleLog.mockClear();
      mockFetch.mockClear();
    });
    it("prints logs, returns a value", async () => {
      const wf = cw.workflow(
        {
          name: "Test",
        },
        async function () {
          log("Testing logs");
          return 123;
        }
      );

      // Run locally
      const returnValue = await wf.run(BASIC_TRIGGER);
      expect(console.log).toHaveBeenCalledWith("Testing logs");
      expect(returnValue).toBe(123);
    });
    it("allows remote fetching", async () => {
      const wf = cw.workflow(
        {
          name: "Test",
        },
        async function () {
          const fetchResult = await fetch("https://some.url");
          return fetchResult;
        }
      );

      // Run locally
      const returnValue = await wf.run(BASIC_TRIGGER);
      expect(returnValue).toEqual("plaintext result");
    });
  });
});

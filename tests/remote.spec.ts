import { describe } from "node:test";

import cw, { morgen } from "..";
const { log, fetchMorgen } = morgen.util;
const { luxon } = morgen.deps;

// NOTE: These tests require setting MORGEN_API_KEY and the Workflow should be
// configured to have a calendar account (via the UI because it's the only way)
describe("Workflow", () => {
  describe("Remote script running (E2E)", () => {
    it("prints logs, returns a value", async () => {
      const wf = cw.workflow(
        {
          name: "[SDK Automated Test]",
        },
        async function run() {
          log("Testing remote logs");
          return 123;
        }
      );
      await wf.upload();
      const remoteOutput = await wf.trigger();
      expect(remoteOutput.logs.length).toBeGreaterThan(0);
      expect(remoteOutput.logs.map((l) => l.log)).toContainEqual([
        "Testing remote logs",
      ]);
      expect(remoteOutput.result).toBe(123);
    });
    // TODO:
    //   - create a Morgen user account for E2E tests specifically
    it("lists events", async () => {
      const wf = cw.workflow(
        {
          name: "[SDK Automated Test]",
        },
        async function run(trigger) {
          // See the UI to set the calendar ID if this fails
          if (!trigger.accounts?.calendar?.[0]?.calendarId)
            throw new Error("No calendar configured!");
          const calId = trigger.accounts.calendar[0].calendarId;
          const todayStart = luxon.DateTime.now()
            .startOf("day")
            .toISO({ includeOffset: false, suppressMilliseconds: true });
          const todayEnd = luxon.DateTime.now()
            .endOf("day")
            .toISO({ includeOffset: false, suppressMilliseconds: true });
          const getEventsResp = await fetchMorgen(
            "https://sync.morgen.so/v1/events/list" +
              `?calendarIds=${calId}` +
              `&start=${todayStart}` +
              `&end=${todayEnd}`,
            {
              method: "GET",
            }
          );
          const eventsCount = JSON.parse(getEventsResp).data.events.length;
          log("Events today: " + eventsCount);
          return eventsCount;
        }
      );
      await wf.upload();
      const remoteOutput = await wf.trigger();
      expect(typeof remoteOutput.result).toBe("number");
    });
  });
});

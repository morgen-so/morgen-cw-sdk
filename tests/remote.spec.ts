import { describe } from "node:test";

import cw, { sandbox } from "..";
const { log, morgen } = sandbox.util;
const { luxon } = sandbox.deps;

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
          const accId = trigger.accounts.calendar[0].accountId;
          const todayStart = luxon.DateTime.now()
            .startOf("day")
            .toISO({ includeOffset: false, suppressMilliseconds: true });
          const todayEnd = luxon.DateTime.now()
            .endOf("day")
            .toISO({ includeOffset: false, suppressMilliseconds: true });

          const resp = await morgen().events.listEventsV3({
            start: todayStart!,
            end: todayEnd!,
            accountId: accId,
            calendarIds: calId,
          });

          let count = resp.data?.events?.length;
          log("Events today: " + count);

          const accounts = await morgen().accounts.listAccountsV3();
          count = accounts.data?.accounts?.length;
          log("Accounts: " + count);

          const calendars = await morgen().calendars.listCalendarsV3();
          log(JSON.stringify(calendars.data?.calendars, null, 2));
          const calendarColors = calendars.data?.calendars
            ?.map((cal) => ({
              col: cal.color,
              name: cal.name,
              isBusy: cal["morgen.so:metadata"]?.busy,
            }))
            .filter((c) => c.isBusy);
          log(
            "Busy calendars: " +
              calendarColors?.length +
              ": " +
              JSON.stringify(calendarColors)
          );

          const tasks = await morgen().tasks.listTasksV2({
            showCompleted: false,
            updatedAfter: todayStart! + "Z",
          });
          count = tasks.length;
          log("Tasks created today: " + count);

          const { firstName, lastName, email } =
            await morgen().user.getUserIdentityV1();
          log(
            "User: " +
              JSON.stringify({
                firstName,
                lastName,
                email,
              })
          );

          return count;
        }
      );
      await wf.upload();
      const remoteOutput = await wf.trigger();
      expect(typeof remoteOutput.result).toBe("number");
    });
  });
});

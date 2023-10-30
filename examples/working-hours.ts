// import cw, { sandbox } from "morgen-cw-sdk";

import cw, { sandbox } from "../src";
import { WorkBlock, isDuringWorkHours } from "./utility-functions";

const { log, morgen } = sandbox.util;
const { luxon } = sandbox.deps;

const workblocks: WorkBlock[] = [
  { day: 1, startHour: 8, endHour: 18 },
  { day: 2, startHour: 8, endHour: 18 },
  { day: 3, startHour: 8, endHour: 18 },
  { day: 4, startHour: 8, endHour: 18 },
  { day: 5, startHour: 8, endHour: 18 },
]

const wf = cw.workflow(
  {
    name: "working-hours"
  },
  async function run(trigger) {
    if (!trigger.accounts?.calendar?.[0]?.calendarId) {
      throw new Error("No calendar configured!");
    }
    const accountId = trigger.accounts.calendar?.[0].accountId;
    const calId = trigger.accounts.calendar?.[0].calendarId;
    const start = luxon.DateTime.now();

    const startTs = start
      .toISO({ includeOffset: false, suppressMilliseconds: true });
    const endTs = start
      .startOf("day")
      .plus({ days: 2 })
      .toISO({ includeOffset: false, suppressMilliseconds: true });

    morgen().events.listEventsV3({
      start: startTs,
      end: endTs,
      accountId: accountId,
      calendarIds: calId,
    }).then((resp) => {
      for (const event of resp.data.events) {
        log(`Checking ${event.title}...`)
        if (isDuringWorkHours(event, workblocks, 'America/New_York')) {
          log(`Event ${event.title} ${event.start} is during work hours!`)
        } else {
          log(`Event ${event.title} ${event.start} is not during work hours!`)
        }
      }
    })
  }
)

wf.upload(
  {
    userUtilities: [
      {import_name: "utility-functions", value: isDuringWorkHours},
      {value: workblocks, name: "workblocks"}
    ]
  }
)
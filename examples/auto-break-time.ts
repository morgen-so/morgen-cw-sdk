// import cw, { morgen } from "morgen-cw-sdk";
import { Interval } from "luxon";
import cw, { sandbox } from "../src";
import { fetchJSON, fetchMorgen, morgen } from "../src/global";

const { log } = sandbox.util;
const { luxon } = sandbox.deps;

const wf = cw.workflow(
  {
    name: "Automatic breaks (SDK test)",
  },
  async function run(trigger) {
    if (!trigger.accounts?.calendar?.[0]?.calendarId)
      throw new Error("No calendar configured!");
    const { accountId, calendarId } = trigger.accounts.calendar[0];

    // Break preferences for the working day every day
    //  e.g. "10am, 3pm, 6pm"
    //  duration: { minutes: 15 }
    const preferredBreaks = [
      {
        time: "10:00",
        title: "Coffee ☕️✨",
        duration: { minutes: 15 },
      },
      {
        time: "12:00",
        title: "Lunch 🥪",
        duration: { minutes: 60 },
      },
      {
        time: "15:00",
        title: "Stretch break 🧘",
        duration: { minutes: 30 },
      },
    ];

    const { DateTime, Interval, Duration } = luxon;

    const rangeDays = 7;

    // Get events for the next 7 days
    const today = DateTime.now().setZone("Europe/Zurich").startOf("day");
    const nextWeek = today.plus({ days: rangeDays });

    const evs = await morgen().events.listEventsV3({
      accountId,
      calendarIds: calendarId,
      start: today.toISO({ suppressMilliseconds: true, includeOffset: false })!,
      end: nextWeek.toISO({
        suppressMilliseconds: true,
        includeOffset: false,
      })!,
    });

    const intervals =
      evs?.data?.events?.map((e) => {
        const start = DateTime.fromISO(e.start!, { zone: e.timeZone });
        const end = start.plus(Duration.fromISO(e.duration!));
        return {
          interval: Interval.fromDateTimes(start, end),
          isBreak: e.description?.includes("#break"),
        };
      }) || [];

    const newBreaks: {
      interval: Interval;
      title: string;
    }[] = [];

    for (let day = 0; day < rangeDays; day++) {
      const currentDay = today.plus({ day });
      // Ignore weekends
      if (currentDay.weekday > 5) continue;
      for (let brk of preferredBreaks) {
        const [hour, minute] = brk.time.split(":").map((i) => parseInt(i, 10));
        log(brk.time, brk.time.split(":"));
        log(hour + "h" + minute + "m");
        const duration = Duration.fromObject(brk.duration);

        // Check if the break already exists
        let newInterval = Interval.after(
          currentDay.set({ hour, minute }),
          duration
        );

        let existingInterval = intervals.find((existingInterval) =>
          existingInterval.interval.intersection(newInterval)
        );
        let shouldCreateBreak = true;
        // Until there is no intersection with an existing interval, move the
        // newly proposed break time
        while (existingInterval) {
          // There's an intersection, give up if it is equal to the break
          if (
            existingInterval.interval.equals(newInterval) &&
            existingInterval.isBreak
          ) {
            existingInterval = undefined;
            shouldCreateBreak = false;
            // Do not add the break, there's already one there
            continue;
          }
          // There's an intersection, but it's not a break,
          // so move the start time to the end of this event.
          newInterval = newInterval.set({
            start: existingInterval.interval.end!,
            end: existingInterval.interval.end?.plus(newInterval.toDuration()),
          });
          // Check whether this new interval intersects with an existing one
          existingInterval = intervals.find(
            (existingInterval) =>
              newInterval && existingInterval.interval.intersection(newInterval)
          );
        }
        if (!shouldCreateBreak) continue;
        newBreaks.push({
          ...brk,
          title: brk.title || "Break",
          interval: newInterval,
        });
      }
    }

    log(JSON.stringify(newBreaks));
    log(accountId + " " + calendarId);

    for (let brk of newBreaks) {
      const start = brk.interval.start!.toISO({
        suppressMilliseconds: true,
        includeOffset: false,
      })!;
      log("Creating ... " + JSON.stringify({ start, title: brk.title }));
      const resp = await morgen().events.createEventV3({
        requestBody: {
          calendarId,
          accountId,
          title: brk.title,
          description: "#break",
          timeZone: "Europe/Zurich",
          showWithoutTime: false,
          start,
          duration: brk.interval.toDuration().rescale().toISO()!,
        },
      });
      log("Resp " + JSON.stringify(resp));
    }
  }
);
wf.upload().then(() => wf.trigger());

/*
wf.run({
  httpParams: {},
  eventUpdates: { added: [], removed: [], modified: [] },
  accounts: {
    calendar: [
      {
        accountId: "123",
        calendarId: "123",
      },
    ],
  },
  user: { email: "", firstName: "" },
});
//);
//*/

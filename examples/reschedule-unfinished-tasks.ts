// import cw, { morgen } from "morgen-cw-sdk";
import cw, { sandbox } from "../src";
import {DocumentId} from "../src/generated/models/DocumentId";
import { EventProperties } from "../src/generated/models/EventProperties";
import { EventContextId } from "../src/generated/models/EventContextId";
import { morgen } from "../src/global";

const { log } = sandbox.util;
const { luxon } = sandbox.deps;

/**
 * This example workflow will reschedule any tasks that were incomplete
 * yesterday to an available time today in the order they are found in the
 * previous day.
 */
const wf = cw.workflow(
  {
    name: "Reschedule Unfinished Tasks",
  },
  async function run(trigger) {
    const { DateTime, Duration, Interval } = luxon;
    const dt = (dt: luxon.DateTime) => dt.toISO({ includeOffset: false, suppressMilliseconds: true }) || "";

    // Validate configuration
    if (trigger.accounts?.calendar?.length === 0)
      throw new Error("No calendars configured!");

    // Group calendars by account ID
    const accounts: Record<string, string[]> =
      trigger.accounts.calendar?.reduce((prev, next) => ({
        ...prev,
        [next.accountId]: [...(prev[next.accountId] || []), next.calendarId]
      }), {}) || {};

    // Create start/end timerange
    const today = DateTime.now().setZone('Europe/Zurich').startOf("day");
    const startTs = today.plus({ days: -1 });
    const endTs = today;

    const eventsToReschedule: (DocumentId & EventContextId & EventProperties)[] = [];
    for (const accountId in accounts) {
      // Fetch events from the Morgen API for yesterday
      const eventResp = await morgen().events.listEventsV3({
        accountId,
        calendarIds: accounts[accountId].join(','),
        start: dt(startTs),
        end: dt(endTs),
      });

      // Add unfinished task events to eventsToReschedule,
      const tasks = await morgen().tasks.listTasksV2({ showCompleted: false, limit: 10 });

      eventResp.data?.events?.forEach((ev) => {
        const taskId = ev["morgen.so:metadata"]?.taskId;
        const taskMorgenId = taskId?.match(/^[0-9a-z]+-[0-9a-z]+-[0-9a-z]+-[0-9a-z]+-[0-9a-z]+$/)?.[0];
        if (taskMorgenId) {
          const t = tasks.find(t => t.id.startsWith(taskMorgenId));
          if (t && t.progress === 'needs-action') {
            eventsToReschedule.push(ev);
          }
        }
      })
    }

    // Get user identity to get own ID
    const me = await morgen().user.getUserIdentityV1();

    // Calculate availability intervals today
    const events = await morgen().availability.listAvailabilityV3({
      start: dt(today),
      end: dt(today.plus({day: 1})),
      queryIds: me._id
    })
    log(JSON.stringify(events, null, 2));

    // Get free intervals from availability
    const myAvailability = events.participants[me._id];
    const busyIntervals = myAvailability.events?.map(ev => Interval.fromDateTimes(
      DateTime.fromISO(ev.start!, { zone: ev.timeZone }).setZone('Europe/Zurich'),
      DateTime.fromISO(ev.start!, { zone: ev.timeZone }).setZone('Europe/Zurich')
        .plus(Duration.fromISO(ev.duration!)))) || [];

    // Calculate interval for the working hours of today
    const wdMap = [null, 'MO', 'TU', 'WE', 'TH', 'FR'];
    const weekday = today.weekday;
    const workingHours = me.preferences?.workingHours
      ?.find((wh: string) => wh.startsWith(wdMap[weekday] || 'XX'))
      ?.split('/').slice(1).map((t: string) => parseInt(t.slice(0, 2)));
    const workingInterval =
      workingHours
      ? Interval.fromDateTimes(today.plus({hour: workingHours[0]}), today.plus({hour: workingHours[1]}))
      : Interval.fromDateTimes(today.plus({hour: 8}), today.plus({hour: 17}));

    // Get the interval representing the time left today, so that tasks are not
    // scheduled in the past.
    const dayRemainingInterval = Interval.fromDateTimes(DateTime.now().setZone('Europe/Zurich'), workingInterval.end!);
    // Remove busy intervals from remaining day to get free intervals
    const getFreeIntervals = () => dayRemainingInterval.difference(...busyIntervals);

    log(JSON.stringify({free: getFreeIntervals()}, null, 2));

    eventsToReschedule.forEach(ev => {
      const evDuration = Duration.fromISO(ev.duration!);
      const freeIntervalForEvent = getFreeIntervals().find(
        gap => gap.toDuration().as('minute') >= evDuration.as('minute')
      );
      // If a free interval exists into which this event can be rescheduled...
      if (freeIntervalForEvent) {
        // Move the start time of the event
        ev.start = dt(freeIntervalForEvent.start!);
        // Update busy intervals to include the new event
        busyIntervals.push(Interval.fromDateTimes(
          freeIntervalForEvent.start!,
          freeIntervalForEvent.start!.plus(evDuration),
        ));
        busyIntervals.sort((a,b) => a.start! < b.start! ? -1 : 1);
      }
    })

    let eventUpdateCount = 0;
    eventsToReschedule.map(ev => {
      morgen().events.updateEventV3({
        requestBody: {
          calendarId: ev.calendarId,
          accountId: ev.accountId,
          id: ev.id,
          // Include all 4 of these otherwise the API 400s the request. In
          // reality, only the start is changed.
          start: ev.start,
          timeZone: ev.timeZone,
          duration: ev.duration,
          showWithoutTime: ev.showWithoutTime,
      }}).then(() => {
        eventUpdateCount++;
        log(`${eventUpdateCount} events updated`);
      }).catch(log);
    });
  }
);
wf.upload().then(() => wf.trigger());

// import cw, { morgen } from "morgen-cw-sdk";
import cw, { morgen } from "..";

const { fetchMorgen, log } = morgen.util;
const { luxon } = morgen.deps;

const wf = cw.workflow(
  {
    name: "Time tracker (SDK test)",
  },
  async function run(trigger) {
    if (!trigger.accounts?.calendar?.[0]?.calendarId)
      throw new Error("No calendar configured!");
    const calId = trigger.accounts.calendar[0].calendarId;
    const title = trigger.httpParams.title;

    // - Check if there's an ongoing #tracking task
    // - If the task is different to the ongoing one:
    //   - set the end time of the ongoing task to end now
    //   - create a new task starting now

    log("Uploading new event");
    log(calId);

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
    const trackingEvents = getEventsResp.data.events.filter((ev: any) =>
      ev.description?.includes("#tracking")
    );
    const ongoingEvent = trackingEvents.find((ev: any) =>
      ev.description?.includes("#ongoing")
    );

    if (ongoingEvent) {
      log({ ongoingEvent: ongoingEvent.description });
      // New duration from existing start to now
      const newDuration = luxon.Interval.fromDateTimes(
        luxon.DateTime.fromISO(ongoingEvent.start, {
          zone: ongoingEvent.timeZone,
        }),
        luxon.DateTime.now()
      )
        .toDuration()
        .toISO();
      const { start, timeZone, showWithoutTime } = ongoingEvent;
      // Update ongoing task to end now
      log("Update event with ID " + ongoingEvent.id);
      await fetchMorgen("https://sync.morgen.so/v1/events/update", {
        method: "POST",
        body: JSON.stringify({
          id: ongoingEvent.id,
          calendarId: calId,
          start,
          timeZone,
          showWithoutTime,
          duration: newDuration,
          description:
            "#tracking " +
            (title === ongoingEvent.title ? "#ongoing" : "#finished"),
        }),
      });
    }
    // Either there's no ongoing task or the specified task title is new, so a
    // new task should start being tracked
    if (!ongoingEvent || title !== ongoingEvent.title) {
      const newStart = luxon.DateTime.now().toUTC().toISO()?.split(".")[0];
      const resp = await fetchMorgen(
        "https://sync.morgen.so/v1/events/create",
        {
          method: "POST",
          body: JSON.stringify({
            title,
            calendarId: calId,
            start: newStart,
            duration: "PT10M",
            timeZone: "UTC",
            showWithoutTime: false,
            description: "#tracking #ongoing",
          }),
        }
      );
      log("New task started:", resp);
    }
  }
);

wf.upload().then(async () => {
  const result = await wf.run({
    httpParams: {
      title: "My next task",
    },
    eventUpdates: {
      added: [],
      updated: [],
      removed: [],
    },
    user: {
      email: "",
      firstName: "",
    },
    accounts: {
      calendar: [
        {
          accountId: "",
          calendarId:
            "WyI2NDQxNjgzODU5Y2Y5NWM1YTgyZGQ4M2EiLCJkODQzNjAzOTljZDdlMTkyNmJjOWEyZTljYjliNWUzYzViMmViMDI5ZTMzZWI1M2FlNTQ3ODg1MDg5YTNhM2ZjQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20iXQ",
        },
      ],
    },
  });
  console.info({ result });
});
//.then(() => wf.trigger({ boop: true }));

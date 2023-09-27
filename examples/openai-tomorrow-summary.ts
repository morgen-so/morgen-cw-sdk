// import cw, { morgen } from "morgen-cw-sdk";
import cw, { morgen } from "..";

const { fetchMorgen, log, fetch } = morgen.util;
const { luxon } = morgen.deps;

const wf = cw.workflow(
  {
    name: "SDK Test: OpenAI Tomorrow Summary",
  },
  async function run(trigger) {
    const slackToken = "xoxb-...";
    const openaiToken = "sk-...";
    log("Remember to set tokens here before testing!");
    async function getOpenAIResponse(prompt: string) {
      let resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + openaiToken,
          Accepts: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
        }),
      });
      resp = JSON.parse(resp);
      if (resp.error) {
        throw new Error("Error with OpenAI: " + JSON.stringify(resp.error));
      }
      return resp.choices[0].message.content;
    }
    if (!trigger.accounts?.calendar?.[0]?.calendarId)
      throw new Error("No calendar configured!");
    // Fetch events from tomorrow
    const calId = trigger.accounts.calendar?.[0].calendarId;
    const start = luxon.DateTime.now();
    const startTs = start
      .startOf("day")
      .plus({ days: 1 })
      .toISO({ includeOffset: false, suppressMilliseconds: true });
    const endTs = start
      .startOf("day")
      .plus({ days: 2 })
      .toISO({ includeOffset: false, suppressMilliseconds: true });
    const mresp = await fetchMorgen(
      `https://sync.morgen.so/v1/events/list` +
        `?calendarIds=${calId}` +
        `&start=${startTs}` +
        `&end=${endTs}`,
      {
        method: "GET",
      }
    );
    const evs = JSON.parse(mresp);

    // Get all busy events and format for ChatGPT
    const list: any[] = [];
    for (let ev of evs.data.events) {
      if (ev.freeBusyStatus == "free") continue;
      list.push({
        title: ev.title,
        start: ev.start,
        duration: ev.duration,
      });
    }
    // ChatGPT gets confused if we don't order things chronologically
    list.sort((a, b) => (a.start > b.start ? -1 : 1));

    const summary = await getOpenAIResponse(
      "Summarise the following calendar events in an easily digestable chronological bullet list: " +
        JSON.stringify(list) +
        "\nExample: Events today:\n\t9:00 –\tStandup 15 minutes\n\t12:00 –\tLunch\n\t15:00 –\tCatchup" +
        "\nResponse: "
    );
    log(summary);

    // Send summary to Slack user
    await fetch("https://api.slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${slackToken}`,
        Accept: "application/json",
        ["Content-Type"]: "application/json",
      },
      body: JSON.stringify({
        channel: "@Luke",
        text: summary,
      }),
    });
  }
);
wf.upload().then(() => wf.trigger());

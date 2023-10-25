// import { EventProperties } from 'morgen-cw-sdk/dist/generated/models/EventProperties';
// import { sandbox } from 'morgen-cw-sdk';

import { EventProperties } from '../src/generated/models/EventProperties';
import { sandbox } from '../src';
const { luxon } = sandbox.deps

export interface WorkBlock {
  day: number;
  startHour: number;
  endHour: number;
}

export function isDuringWorkHours(event: EventProperties, workBlocks: WorkBlock[], timeZone?: string) {
  const eventStart = luxon.DateTime.fromISO(event.start, { zone: event.timeZone });
  if (timeZone && event.timeZone !== timeZone) {
    eventStart.setZone(timeZone);
  }
  const eventEnd = eventStart.plus(luxon.Duration.fromISO(event.duration));

  let isDuringWorkHours = false;

  for (const workBlock of workBlocks) {
    if (eventStart.weekday === workBlock.day) {
      /* If the event starts or ends during the work block, or if the event
         starts before the work block and ends after the work block.
         Note: does not handle events that span multiple days.
      */
      
      if (
        (eventStart.hour >= workBlock.startHour && eventStart.hour <= workBlock.endHour) ||
        (eventEnd.hour >= workBlock.startHour && eventEnd.hour <= workBlock.endHour) ||
        (eventStart.hour <= workBlock.startHour && eventEnd.hour >= workBlock.endHour)
      ) {
        isDuringWorkHours = true;
      }
    }
  }
  
  return isDuringWorkHours;
}
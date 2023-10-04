/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type EventProperties = {
    title?: string;
    description?: string;
    locations?: Record<string, {
        name?: string;
    }>;
    /**
     * ISO datetime string, with no time zone information e.g. "2023-09-04T15:11:22"
     */
    start?: string;
    /**
     * ISO duration string e.g. "PT10M"
     */
    duration?: string;
    /**
     * ISO timezone e.g. "Europe/Zurich"
     */
    timeZone?: string;
    /**
     * If true, this is an all-day event
     */
    showWithoutTime?: boolean;
    participants?: Record<string, any>;
    /**
     * Indicates whether the participants are available during the event.
     */
    freeBusyStatus?: EventProperties.freeBusyStatus;
    privacy?: EventProperties.privacy;
    'morgen.so:metadata'?: {
        taskId?: string;
    };
};

export namespace EventProperties {

    /**
     * Indicates whether the participants are available during the event.
     */
    export enum freeBusyStatus {
        FREE = 'free',
        BUSY = 'busy',
        OOO = 'ooo',
    }

    export enum privacy {
        PUBLIC = 'public',
        PRIVATE = 'private',
    }


}


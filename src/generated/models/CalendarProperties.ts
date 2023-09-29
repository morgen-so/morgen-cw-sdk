/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CalendarProperties = {
    name?: string;
    color?: string;
    defaultAlertsWithoutTime?: Record<string, any>;
    defaultAlertsWithTime?: Record<string, any>;
    'morgen.so:metadata'?: {
        /**
         * Indiciates whether an event in this calendar represents an interval where the user is busy.
         */
        busy?: boolean;
    };
};


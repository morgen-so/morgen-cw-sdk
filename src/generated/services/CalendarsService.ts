/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccountProperties } from '../models/AccountProperties';
import type { CalendarContextId } from '../models/CalendarContextId';
import type { CalendarProperties } from '../models/CalendarProperties';
import type { DocumentId } from '../models/DocumentId';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class CalendarsService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Retrieve a list of calendars the user has access to
     * List all the calendars connected to Morgen.
     * @returns any OK
     * @throws ApiError
     */
    public listCalendarsV3(): CancelablePromise<{
        data?: {
            accounts?: Array<AccountProperties>;
            calendars?: Array<(CalendarProperties & CalendarContextId & DocumentId)>;
        };
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v3/calendars/list',
        });
    }

    /**
     * Update calendar metadata
     * @returns void
     * @throws ApiError
     */
    public updateCalendarMetadataV3({
        requestBody,
    }: {
        /**
         * An event object
         */
        requestBody: {
            /**
             * The ID of the calendar to update
             */
            id?: string;
            /**
             * The account ID of the calendar to update
             */
            accountId?: string;
            'morgen.so:metadata'?: {
                busy?: boolean;
            };
        },
    }): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v3/calendars/update',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}

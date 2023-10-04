/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DocumentId } from '../models/DocumentId';
import type { EventContextId } from '../models/EventContextId';
import type { EventProperties } from '../models/EventProperties';
import type { EventPropertiesImmutable } from '../models/EventPropertiesImmutable';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class EventsService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Retrieve events from all calendars
     * Retrieve events from all connected calendars, occurring within a given a [`start`, `end`] time window.
     *
     * @returns any OK
     * @throws ApiError
     */
    public listEventsV3({
        start,
        end,
        accountId,
        calendarIds,
    }: {
        start: string,
        end: string,
        accountId: string,
        /**
         * If a `calendarIds` is specific, only events in the corresponding calendar are returned. To filter for multiple calendars, use calendar ids separated by a comma, i.e. "calendarId_1,calendarId_2".
         *
         */
        calendarIds?: string,
    }): CancelablePromise<{
        data?: {
            events?: Array<(EventProperties & EventContextId & DocumentId)>;
        };
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v3/events/list',
            query: {
                'start': start,
                'end': end,
                'accountId': accountId,
                'calendarIds': calendarIds,
            },
        });
    }

    /**
     * Create a calendar event
     * @returns any OK
     * @throws ApiError
     */
    public createEventV3({
        requestBody,
    }: {
        /**
         * An event object
         */
        requestBody: (EventContextId & EventProperties),
    }): CancelablePromise<(EventContextId & EventPropertiesImmutable & EventProperties & DocumentId & {
        /**
         * If specified, a virtual video conferencing room will be added to the event. Only supported for O365/Google events.
         */
        'morgen.so:requestVirtualRoom'?: 'default';
    })> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v3/events/create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Update a calendar event
     * @returns void
     * @throws ApiError
     */
    public updateEventV3({
        requestBody,
    }: {
        /**
         * An event object
         */
        requestBody: (DocumentId & EventContextId & EventProperties),
    }): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v3/events/update',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Delete a calendar event
     * @returns void
     * @throws ApiError
     */
    public deleteEventV3({
        requestBody,
    }: {
        /**
         * The identifier of the event to delete
         */
        requestBody: (EventContextId & DocumentId),
    }): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v3/events/delete',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}

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

export class AvailabilityService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * List availability of team members or the requesting user
     * @returns any OK
     * @throws ApiError
     */
    public listAvailabilityV3({
        start,
        end,
        queryIds,
    }: {
        /**
         * ISO datetime string, with no time zone information e.g. "2023-09-04T15:11:22"
         */
        start?: string,
        /**
         * ISO datetime string, with no time zone information e.g. "2023-09-04T15:11:22"
         */
        end?: string,
        /**
         * The IDs of users to query, must be the current user or members of the user's team.
         */
        queryIds?: string,
    }): CancelablePromise<{
        participants: Record<string, {
            events?: Array<(DocumentId & EventContextId & EventPropertiesImmutable & EventProperties)>;
        }>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v3/availability/list',
            query: {
                'start': start,
                'end': end,
                'queryIds': queryIds,
            },
        });
    }

}

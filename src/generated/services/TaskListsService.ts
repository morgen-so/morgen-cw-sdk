/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DocumentId } from '../models/DocumentId';
import type { TaskListContextId } from '../models/TaskListContextId';
import type { TaskListProperty } from '../models/TaskListProperty';
import type { TaskListUpdateProperty } from '../models/TaskListUpdateProperty';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class TaskListsService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Retrieve task lists
     * Retrieve task lists from Morgen or third-party tasks providers (e.g. Todoist). Notice that the notion of a list might map to a different entity on other providers.
     * @returns any OK
     * @throws ApiError
     */
    public listTaskListsV2({
        title,
        limit = 1,
        updatedAfter,
        serviceName,
        accountId,
    }: {
        title?: string,
        limit?: number,
        /**
         * Lower bound for a task list's last modification time (as a RFC 3339 timestamp) to filter by. Optional. When used, `summary` is ignored.
         */
        updatedAfter?: string,
        /**
         * Required for external task services
         */
        serviceName?: string,
        /**
         * Required for external task services
         */
        accountId?: string,
    }): CancelablePromise<Array<(DocumentId & TaskListContextId & TaskListProperty)>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v2/taskLists/list',
            query: {
                'title': title,
                'limit': limit,
                'updatedAfter': updatedAfter,
                'serviceName': serviceName,
                'accountId': accountId,
            },
        });
    }

    /**
     * Create a task list in Morgen
     * Create a new task list in Morgen. Currently it is not possible to create lists on third-party task apps with this API.
     * @returns any OK
     * @throws ApiError
     */
    public createTaskListV2({
        requestBody,
    }: {
        /**
         * A task list
         */
        requestBody: TaskListProperty,
    }): CancelablePromise<(DocumentId & TaskListContextId)> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v2/taskLists/create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Update a task list in Morgen
     * Update a Morgen task list.
     * @returns void
     * @throws ApiError
     */
    public updateTaskListV2({
        requestBody,
    }: {
        /**
         * A task list
         */
        requestBody: (DocumentId & TaskListUpdateProperty),
    }): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v2/taskLists/update',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Delete a task list
     * @returns void
     * @throws ApiError
     */
    public deleteTaskListV2({
        requestBody,
    }: {
        requestBody: DocumentId,
    }): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v2/taskLists/delete',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}

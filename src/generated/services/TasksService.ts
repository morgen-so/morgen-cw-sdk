/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DocumentId } from '../models/DocumentId';
import type { TaskContextId } from '../models/TaskContextId';
import type { TaskCreateProperties } from '../models/TaskCreateProperties';
import type { TaskProperties } from '../models/TaskProperties';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class TasksService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Retrieve tasks
     * @returns any OK
     * @throws ApiError
     */
    public listTasksV2({
        showCompleted,
        title,
        limit = 1,
        updatedAfter,
        serviceName,
        accountId,
    }: {
        /**
         * Flag indicating whether deleted tasks are returned in the result. Optional. The default is False.
         */
        showCompleted: boolean,
        /**
         * Filter on the title of the task. Optional.
         */
        title?: string,
        /**
         * Limit the numer of tasks returned. Optional.
         */
        limit?: number,
        /**
         * Lower bound for a task's last modification time (as a RFC 3339 timestamp) to filter by. Optional. When used, `summary` and `showCompleted` are ignored.
         */
        updatedAfter?: string,
        /**
         * Required for external tasks. Optional. By default returns Morgen tasks.
         */
        serviceName?: 'googleTasks' | 'microsoftOutlook' | 'microsoftToDo' | 'morgen' | 'todoist',
        /**
         * Required for external tasks. Optional. By default returns Morgen tasks.
         */
        accountId?: string,
    }): CancelablePromise<Array<(DocumentId & TaskContextId & TaskProperties)>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v2/tasks/list',
            query: {
                'title': title,
                'limit': limit,
                'showCompleted': showCompleted,
                'updatedAfter': updatedAfter,
                'serviceName': serviceName,
                'accountId': accountId,
            },
        });
    }

    /**
     * Create a Morgen task
     * @returns any OK
     * @throws ApiError
     */
    public createTaskV2({
        requestBody,
    }: {
        /**
         * Create a task in Morgen
         */
        requestBody: TaskCreateProperties,
    }): CancelablePromise<(DocumentId & TaskContextId)> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v2/tasks/create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Update a task
     * @returns void
     * @throws ApiError
     */
    public updateTaskV2({
        requestBody,
    }: {
        /**
         * A task patch object. All properties are optional. Only "status" can be updated for external tasks.
         */
        requestBody: (DocumentId & TaskContextId & TaskProperties),
    }): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v2/tasks/update',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Delete a task
     * @returns void
     * @throws ApiError
     */
    public deleteTaskV2({
        requestBody,
    }: {
        requestBody: DocumentId,
    }): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v2/tasks/delete',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Close a task
     * @returns void
     * @throws ApiError
     */
    public closeTaskV2({
        requestBody,
    }: {
        requestBody: (DocumentId & TaskContextId),
    }): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v2/tasks/close',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Reopen a task
     * @returns void
     * @throws ApiError
     */
    public reopenTaskV2({
        requestBody,
    }: {
        requestBody: (TaskContextId & DocumentId),
    }): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v2/tasks/reopen',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}

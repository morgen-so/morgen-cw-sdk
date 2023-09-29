/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type TaskCreateProperties = {
    title: string;
    description?: string;
    descriptionContentType?: TaskCreateProperties.descriptionContentType;
    due?: string;
    estimatedDuration?: string;
    priority?: number;
    progress?: TaskCreateProperties.progress;
    taskListId?: string;
};

export namespace TaskCreateProperties {

    export enum descriptionContentType {
        TEXT_PLAIN = 'text/plain',
        TEXT_HTML = 'text/html',
    }

    export enum progress {
        NEEDS_ACTION = 'needs-action',
        COMPLETED = 'completed',
    }


}


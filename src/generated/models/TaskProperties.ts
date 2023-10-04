/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type TaskProperties = {
    title?: string;
    description?: string;
    descriptionContentType?: TaskProperties.descriptionContentType;
    due?: string;
    estimatedDuration?: string;
    priority?: number;
    progress?: TaskProperties.progress;
    position?: number;
    taskListId?: string;
};

export namespace TaskProperties {

    export enum descriptionContentType {
        TEXT_PLAIN = 'text/plain',
        TEXT_HTML = 'text/html',
    }

    export enum progress {
        NEEDS_ACTION = 'needs-action',
        COMPLETED = 'completed',
    }


}


/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { FetchHttpRequest } from './core/FetchHttpRequest';

import { AccountsService } from './services/AccountsService';
import { AvailabilityService } from './services/AvailabilityService';
import { CalendarsService } from './services/CalendarsService';
import { EventsService } from './services/EventsService';
import { TaskListsService } from './services/TaskListsService';
import { TasksService } from './services/TasksService';
import { UserService } from './services/UserService';

type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;

export class Morgen {

    public readonly accounts: AccountsService;
    public readonly availability: AvailabilityService;
    public readonly calendars: CalendarsService;
    public readonly events: EventsService;
    public readonly taskLists: TaskListsService;
    public readonly tasks: TasksService;
    public readonly user: UserService;

    public readonly request: BaseHttpRequest;

    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = FetchHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? 'https://api.morgen.so',
            VERSION: config?.VERSION ?? '3.0.0',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });

        this.accounts = new AccountsService(this.request);
        this.availability = new AvailabilityService(this.request);
        this.calendars = new CalendarsService(this.request);
        this.events = new EventsService(this.request);
        this.taskLists = new TaskListsService(this.request);
        this.tasks = new TasksService(this.request);
        this.user = new UserService(this.request);
    }
}


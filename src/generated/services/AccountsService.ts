/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccountProperties } from '../models/AccountProperties';
import type { IntegrationGroups } from '../models/IntegrationGroups';
import type { Integrations } from '../models/Integrations';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class AccountsService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Get a list of supported services
     * @returns any OK
     * @throws ApiError
     */
    public listIntegrationsV3(): CancelablePromise<{
        data?: {
            groups?: IntegrationGroups;
            integrations?: Integrations;
        };
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v3/integrations/list',
        });
    }

    /**
     * Retrieve accounts list
     * Retrieve a list of accounts the user has access to
     * @returns any OK
     * @throws ApiError
     */
    public listAccountsV3(): CancelablePromise<{
        data?: {
            accounts?: Array<AccountProperties>;
        };
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v3/integrations/accounts/list',
        });
    }

}

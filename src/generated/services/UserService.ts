/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserProperties } from '../models/UserProperties';
import type { UserPropertiesImmutable } from '../models/UserPropertiesImmutable';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class UserService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Get user profile
     * @returns any OK
     * @throws ApiError
     */
    public getUserIdentityV1(): CancelablePromise<(UserPropertiesImmutable & UserProperties)> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/identity',
        });
    }

    /**
     * Update user profile
     * @returns any OK
     * @throws ApiError
     */
    public updateUserProfileV1({
        requestBody,
    }: {
        /**
         * User fields to be updated
         */
        requestBody: UserProperties,
    }): CancelablePromise<(UserPropertiesImmutable & UserProperties)> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/identity/update',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}

/**
 * Config used to create/update workflow objects in the platform.
 */
export type WorkflowConfig = {
  /**
   * Name given to the uploaded workflow object.
   */
  name: string;
};

/**
 * Trigger data passed to a custom workflow `run` function when triggered.
 */
export type WorkflowTrigger = {
  /**
   * Parameters passed via the HTTP trigger.
   *   - GET request: query parameters
   *   - POST request: JSON body
   *
   * E.g. by sending an HTTP to:
   * ```
   *   https://api.morgen.so/workflows/run/[trigger_id]?param1=123&param2=456
   * ```
   *
   * The httpParams will be set to `{ param1: 123, param2: 456 }`.
   */
  httpParams: Record<string, string>;
  /**
   * Changes to the specified trigger calendar since the previous trigger.
   * Each field is an array of Event[].
   *
   * NOTE: This is available for ANY trigger, and will update the underlying
   * state that tracks which events have already been passed in a previous
   * trigger.
   */
  eventUpdates: { added: []; removed: []; modified: [] };
  /**
   * Accounts that have been integrated by the user in-app.
   */
  accounts: {
    /**
     * An array of calendars provided by workflow configuration
     * E.g. [{accountId: "...", calendarId: "..."}]
     */
    calendar?: {
      accountId: string;
      calendarId: string;
    }[];
  };
  user: {
    /** The primary email address associated with the user's account */
    email: string;
    /** The user's first name */
    firstName: string;
  };
  // TODO:
  // tokens: [{name: 'openapi', value: '123456789'}]
};

/**
 * Workflow user script function. Must be named `run`.
 */
export type WorkflowFunction<T> = (trigger: WorkflowTrigger) => Promise<T>;

export type WorkflowResult = {
  result: unknown | { error: string; stack: string[] };
  logs: {
    ts: string;
    log: string;
  }[];
};

export interface UtilityNaming {
  name: string;
  import_name: string;
  default: boolean
}

export interface UserUtilityVariable {
  name: string;
  value: any;
  import_name?: string;
  default?: boolean
}

export interface UserUtilityImport {
  value: any;
  import_name: string;
}

export type UserUtility = Function | UserUtilityVariable | UserUtilityImport;
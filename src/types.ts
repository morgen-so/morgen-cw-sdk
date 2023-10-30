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

/**
 * Internal interface for specifying user utilities for replacement
 * within a script.  It is built from the different types of user
 * utilities for a uniform interface.
 */
export interface UtilityNaming {
  /** The name of the utility, if it is a function or class, if it is
   * a function or class it is inferred from the passed function.  If
   * it is a variable, then it must be specified using the `name`
   * property of the UserUtilityVariable interface.
   */
  name: string;
  /** The canonicalised name of the module that the utility is imported
   * from.  This is used to build the replacement usage within the
   * generated script.
   */
  import_name: string;
  /** Whether the utility is the default export from the module.  This
   * is used to build the replacement usage within the generated script.
   */
  default: boolean;
}

/**
 * Interface for specifying a user utility variable.  Either from outside
 * of the script, or an imported module.
 */
export interface UserUtilityVariable {
  /** The name of the variable or function within the script */
  name: string;
  /** The value of the variable, or the function */
  value: any;
  /** The final part of the module name that the function or class is imported from
   * eg:
   * ```
   * import { foo } from 'bar'
   * import_name = 'bar'
   *
   * import { foo } from 'bar/baz'
   * import_name = 'baz'
   *
   * import { foo } from 'bar/baz-foo'
   * import_name = 'baz-foo'
   * ```
   */
  import_name?: string;
  /** Whether the variable is the default export from the module
   * this is used to build the replacement usage within the generated script
   */
  default?: boolean;
}

/**
 * Interface for specifying a user utility import.  This is used to
 * use a function/class within the script that is imported from
 * another module.
 */
export interface UserUtilityImport {
  /** The function or class that is imported from the module */
  value: any;
  /** The final part of the module name that the function or class is imported from
   * eg:
   * ```
   * import { foo } from 'bar'
   * import_name = 'bar'
   *
   * import { foo } from 'bar/baz'
   * import_name = 'baz'
   *
   * import { foo } from 'bar/baz-foo'
   * import_name = 'baz-foo'
   * ```
   */
  import_name: string;
}

/**
 * The possible types of user utilities that can be passed to the
 * `upload` method.
 */
export type UserUtility = Function | UserUtilityVariable | UserUtilityImport;

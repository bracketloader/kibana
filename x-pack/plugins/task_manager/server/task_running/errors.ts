/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { EphemeralTask } from '../task';

// Unrecoverable
const CODE_UNRECOVERABLE = 'TaskManager/unrecoverable';
const CODE_RETRYABLE = 'TaskManager/retryable';

const code = Symbol('TaskManagerErrorCode');
const retry = Symbol('TaskManagerErrorRetry');

export interface DecoratedError extends Error {
  [code]?: string;
  [retry]?: Date | boolean;
}

export class EphemeralTaskRejectedDueToCapacityError extends Error {
  private _task: EphemeralTask;

  constructor(message: string, task: EphemeralTask) {
    super(message);
    this._task = task;
  }

  public get task() {
    return this._task;
  }
}

function isTaskManagerError(error: unknown): error is DecoratedError {
  return Boolean(error && (error as DecoratedError)[code]);
}

export function isUnrecoverableError(error: Error | DecoratedError) {
  return isTaskManagerError(error) && error[code] === CODE_UNRECOVERABLE;
}

export function throwUnrecoverableError(error: Error) {
  (error as DecoratedError)[code] = CODE_UNRECOVERABLE;
  throw error;
}

export function isRetryableError(error: Error | DecoratedError) {
  if (isTaskManagerError(error) && error[code] === CODE_RETRYABLE) {
    return error[retry];
  }
  return null;
}

export function throwRetryableError(error: Error, shouldRetry: Date | boolean) {
  (error as DecoratedError)[code] = CODE_RETRYABLE;
  (error as DecoratedError)[retry] = shouldRetry;
  throw error;
}

export function isEphemeralTaskRejectedDueToCapacityError(
  error: Error | EphemeralTaskRejectedDueToCapacityError
) {
  return Boolean(error && error instanceof EphemeralTaskRejectedDueToCapacityError);
}

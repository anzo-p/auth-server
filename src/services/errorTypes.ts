export class ServiceError {
  constructor(public message?: string) {}
}

export class DuplicateRequest extends ServiceError {}
export class GoneEntity extends ServiceError {}
export class InternalError extends ServiceError {}
export class InvalidArgument extends ServiceError {}
export class MissingArgument extends ServiceError {}
export class NonexistentEntity extends ServiceError {}

export interface ServiceResult {
  data?: object;
  error?: ServiceError;
}

export function createErrorResult(error: ServiceError): ServiceResult {
  return {
    error
  };
}

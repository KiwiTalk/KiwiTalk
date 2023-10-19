type SuccessResponse<T> = { type: 'Success', content: T };
type FailedResponse = { type: 'Failure', content: number };

export type Response<T> = SuccessResponse<T> | FailedResponse;

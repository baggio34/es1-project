export type ApiResult<T> =
  | { error: string }
  | T

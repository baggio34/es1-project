export type Result<Ok, Err> =
  | { isOk: false, isErr: true, err: Err }
  | { isOk: true, isErr: false, ok: Ok }

export const Err = <T, E>(err: E): Result<T, E> => ({ isOk: false, isErr: true, err })
export const Ok = <T, E>(ok: T): Result<T, E> => ({ isOk: true, isErr: false, ok })

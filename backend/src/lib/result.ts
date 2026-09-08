export type Result<Ok, Err> = OkResult<Ok, Err> | ErrResult<Ok, Err>;

class OkResult<T, E> {
  readonly isOk = true as const;
  readonly isErr = false as const;
  constructor(readonly ok: T) { }

  map<U>(fn: (val: T) => U): Result<U, E> {
    return new OkResult<U, E>(fn(this.ok));
  }
  then<U>(fn: (val: T) => Result<U, E>): Result<U, E> {
    return fn(this.ok);
  }
  unwrap(): T {
    return this.ok
  }
}

class ErrResult<T, E> {
  readonly isOk = false as const;
  readonly isErr = true as const;
  constructor(readonly err: E) { }

  map<U>(_fn: (val: T) => U): Result<U, E> {
    return this as unknown as Result<U, E>;
  }
  then<U>(_fn: (val: T) => Result<U, E>): Result<U, E> {
    return this as unknown as Result<U, E>;
  }
  unwrap(): T {
    throw `ERROR: called unwrap on Err variant of Result type.\nValue of the error stores: '${this.err}'`
  }
}

export const Ok = <T, E>(ok: T): Result<T, E> => new OkResult<T, E>(ok);
export const Err = <T, E>(err: E): Result<T, E> => new ErrResult<T, E>(err);

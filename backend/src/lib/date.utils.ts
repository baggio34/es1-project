// thx again gemini
export type SerializeDates<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends Date | undefined
      ? string | undefined
      : T[K] extends Date | null
        ? string | null
        : T[K];
};

export function serializeDates<T extends Record<string, any>>(obj: T): SerializeDates<T> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    result[key] = value instanceof Date ? value.toISOString() : value;
  }

  return result as SerializeDates<T>;
}

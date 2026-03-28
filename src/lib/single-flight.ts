const inFlight = new Map<string, Promise<unknown>>();

export async function singleFlight<T>(key: string, work: () => Promise<T>): Promise<T> {
  const existing = inFlight.get(key);
  if (existing) return existing as Promise<T>;

  const task = work().finally(() => {
    inFlight.delete(key);
  });

  inFlight.set(key, task);
  return task;
}

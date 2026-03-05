// Structured logger for Workers Logs — emits JSON objects for dashboard filtering.
// Workers Logs runtime handles serialisation and timestamping automatically.

type LogData = Record<string, unknown>;

export function log(event: string, data?: LogData): void {
  console.log({ event, ...data });
}

export function warn(event: string, data?: LogData): void {
  console.warn({ event, ...data });
}

export function logError(event: string, err?: unknown, data?: LogData): void {
  const message = err instanceof Error ? err.message : String(err ?? '');
  console.error({ event, error: message, ...data });
}

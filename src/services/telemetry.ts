/**
 * Structured telemetry / analytics logging (BE-009).
 *
 * CLAUDE.md Section 2: "Instrument everything."
 * Every operation emits a structured log line with:
 * timestamp, operation, duration, success/fail, and entity ID.
 *
 * In v1, events are logged to the console in development.
 * The telemetry feature flag controls whether logging is active.
 */

interface TelemetryEvent {
  readonly event: string;
  readonly timestamp: string;
  readonly data: Record<string, unknown>;
}

/** Whether telemetry is enabled. Set by the feature flag store. */
let telemetryEnabled = false;

/**
 * Enable or disable telemetry logging.
 */
export function setTelemetryEnabled(enabled: boolean): void {
  telemetryEnabled = enabled;
}

/**
 * Log a structured telemetry event.
 *
 * @param event - Event name (e.g., 'match_started', 'reroll_used')
 * @param data - Event-specific key-value data
 */
export function logEvent(
  event: string,
  data: Record<string, unknown> = {}
): void {
  if (!telemetryEnabled) return;

  const entry: TelemetryEvent = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  // In development, log to console with structured format
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[telemetry] ${entry.event}`,
      JSON.stringify(entry.data, null, 2)
    );
  }
}

/**
 * Log the start of a timed operation.
 * Returns a function to call when the operation completes.
 *
 * @param operation - Operation name
 * @param entityId - Optional entity identifier
 * @returns A function to call on completion (pass success boolean)
 */
export function startOperation(
  operation: string,
  entityId?: string
): (success: boolean, extraData?: Record<string, unknown>) => void {
  const startTime = Date.now();

  return (success: boolean, extraData: Record<string, unknown> = {}) => {
    const duration = Date.now() - startTime;
    logEvent(operation, {
      duration,
      success,
      entityId,
      ...extraData,
    });
  };
}

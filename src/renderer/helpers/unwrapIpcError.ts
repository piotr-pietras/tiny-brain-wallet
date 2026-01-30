const ELECTRON_IPC_INVOKE_PREFIX =
  /^Error invoking remote method '([^']+)':\s*/;

/**
 * Normalizes common Electron IPC `invoke` errors into a user-facing message.
 *
 * Electron wraps main-process failures as:
 * `Error invoking remote method 'some-action': <message>`
 */
export const unwrapIpcError = (error: Error): string => {
  return error.message.replace(ELECTRON_IPC_INVOKE_PREFIX, "").trim();
};
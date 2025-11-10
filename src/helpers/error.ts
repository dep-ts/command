/**
 * Custom error class for command-related errors.
 * Extends the built-in Error class to provide specific error handling for CLI commands.
 */
export class CommandError extends Error {
  /**
   * Creates a new CommandError instance.
   * @param message - The error message describing the issue.
   */
  constructor(message: string) {
    super(message);
    this.name = 'CommandError';
  }
}

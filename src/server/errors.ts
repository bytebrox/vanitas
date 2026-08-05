/**
 * Raised when a deployment is missing a secret the marketplace needs.
 *
 * Kept apart from the API error types so that both the config reader and the
 * database client can throw it without either depending on the HTTP layer. The
 * request handler turns it into a 503, which tells an operator "this box is
 * not set up" rather than the "something broke" that a 500 implies.
 */
export class ConfigError extends Error {
  constructor(readonly variable: string) {
    super(`Missing environment variable ${variable}`);
    this.name = 'ConfigError';
  }
}

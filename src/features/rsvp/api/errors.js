/** The request never got a usable answer: offline, timeout, bad JSON, or still "Busy" after the retry. */
export class NetworkError extends Error {
  constructor(message = 'Network error') {
    super(message);
    this.name = 'NetworkError';
  }
}

/** The script answered with status false. `message` is the script's exact text (see API_MESSAGE). */
export class ApiError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ApiError';
  }
}

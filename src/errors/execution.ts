export default class ExecutionError extends Error {
  innerError: Error;

  constructor(message, innerError) {
    super();
    this.message = message;
    this.innerError = innerError;
  }
};

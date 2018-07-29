export default class ExecutionError extends Error {
  innerError: Error;

  constructor(message: string, innerError: Error) {
    super();
    this.message = message;
    this.innerError = innerError;
  }
};

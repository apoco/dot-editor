export default class ExecutionError extends Error {
  constructor(message, innerError) {
    super();
    this.message = message;
    this.innerError = innerError;
  }
};

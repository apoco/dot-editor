export default class FailedOutputError extends Error {
  code: string;
  errorOutput: string;

  constructor(code, errorOutput) {
    super();
    this.message = 'Failed to create diagram';
    this.code = code;
    this.errorOutput = errorOutput;
  }
}

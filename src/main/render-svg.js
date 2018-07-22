import { spawn } from 'child_process';

import createStringStream from './string-stream';
import ExecutionError from '../errors/execution';
import FailedOutputError from '../errors/failed-output';

export default async function renderSvg(code) {
  return new Promise((resolve, reject) => {
    const outputChunks = [];
    const errChunks = [];

    const proc = spawn('dot', ['-Tsvg']);

    proc
      .once('error', err => {
        reject(new ExecutionError('Failed to render SVG', err))
      })
      .once('exit', code => {
        if (code) {
          return void resolve({
            errors: errChunks.join('')
          });
        }

        resolve({
          svg: outputChunks.join(''),
          errors: errChunks.join('')
        });
      });

    proc.stderr.on('data', chunk => errChunks.push(chunk));
    proc.stdout.on('data', chunk => outputChunks.push(chunk));

    createStringStream(code).pipe(proc.stdin);
  });
}

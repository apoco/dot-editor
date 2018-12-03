import { spawn } from "child_process";
import { createWriteStream } from "fs";

import createStringStream from "./string-stream";

export type ExportResult = { errors: string };

export default async function exportImage(opts: {
  code: string;
  filename: string;
  format: string;
}): Promise<ExportResult> {
  return new Promise<ExportResult>((resolve, reject) => {
    const fileStream = createWriteStream(opts.filename);
    const errChunks: Array<string | Buffer> = [];

    const proc = spawn("dot", [`-T${opts.format}`]);

    proc.once("error", reject).once("exit", code => {
      if (code) {
        return void reject(new Error(errChunks.join("")));
      }

      resolve({
        errors: errChunks.join("")
      });
    });

    proc.stderr.on("data", chunk => errChunks.push(chunk));
    proc.stdout.pipe(fileStream);

    createStringStream(opts.code).pipe(proc.stdin);
  });
}

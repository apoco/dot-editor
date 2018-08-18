import { spawn } from "child_process";

import createStringStream from "./string-stream";

type RenderOpts = { code: string };
export type RenderResult = { svg: string | null; errors: string };

export default async function renderSvg({
  code
}: RenderOpts): Promise<RenderResult> {
  return new Promise<RenderResult>(resolve => {
    const outputChunks: Array<string | Buffer> = [];
    const errChunks: Array<string | Buffer> = [];

    const proc = spawn("dot", ["-Tsvg"]);

    proc
      .once("error", err => {
        resolve({ svg: null, errors: err.message });
      })
      .once("exit", code => {
        if (code) {
          return void resolve({
            svg: null,
            errors: errChunks.join("")
          });
        }

        resolve({
          svg: outputChunks.join(""),
          errors: errChunks.join("")
        });
      });

    proc.stderr.on("data", chunk => errChunks.push(chunk));
    proc.stdout.on("data", chunk => outputChunks.push(chunk));

    createStringStream(code).pipe(proc.stdin);
  });
}

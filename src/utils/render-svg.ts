import { spawn } from "child_process";

import createStringStream from "./string-stream";
import ExecutionError from "../errors/execution";

type RenderOpts = { code: string };
type RenderResult = { svg?: string; errors: string };

export default async function renderSvg({
  code
}: RenderOpts): Promise<RenderResult> {
  return new Promise<RenderResult>((resolve, reject) => {
    const outputChunks: Array<string | Buffer> = [];
    const errChunks: Array<string | Buffer> = [];

    const proc = spawn("dot", ["-Tsvg"]);

    proc
      .once("error", err => {
        reject(new ExecutionError("Failed to render SVG", err));
      })
      .once("exit", code => {
        if (code) {
          return void resolve({
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

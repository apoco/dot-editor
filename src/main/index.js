import { app } from "electron";

import startAppSession from "./sessions/app";

app.on("ready", startAppSession);

import { app } from "electron";

import startAppSession from "./sessions/app-session";

app.on("ready", startAppSession);

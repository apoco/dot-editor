import { app } from "electron";

import startAppSession from "./app-session";

app.on("ready", startAppSession);

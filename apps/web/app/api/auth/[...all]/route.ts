import { auth } from "@mobiliza/auth";
import { authEnv } from "@mobiliza/env/auth";

import { toNextJsHandler } from "better-auth/next-js";

console.log("Variáveis", authEnv, authEnv.WEB_URL, authEnv.NEXT_PUBLIC_WEB_URL);

export const { GET, POST } = toNextJsHandler(auth);

import Router from "@koa/router";
import { general } from "./controllers";

const unprotectedRouter = new Router();

// welcome page route
unprotectedRouter.get("/", general.helloWorld);

export { unprotectedRouter };
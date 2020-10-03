import Koa from "koa";
import winston from "winston";
import helmet from "koa-helmet";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import { createConnection } from "typeorm";
import "reflect-metadata";

import { logger } from "./logger";
import { config } from "./config";
import { cron } from "./cron";
import { unprotectedRouter } from "./unprotectedRoutes";
import { protectedRouter } from "./protectedRoutes";

// create connection with database
createConnection({
  type: "postgres",
  url: config.databaseUrl,
  synchronize: true,
  logging: false,
  entities: config.dbEntitiesPath,
  extra: {
      ssl: config.dbsslconn, // if not development, will use SSL
  }
}).then(async () => {
  const app = new Koa();

  // middlewares
  app.use(helmet());
  app.use(cors());
  app.use(logger(winston));
  app.use(bodyParser());

  // routes
  app.use(unprotectedRouter.routes()).use(unprotectedRouter.allowedMethods());
  // do not protect swagger-json and swagger-html endpoints
  // app.use(jwt({ secret: jwtSecret }).unless({ path: [/^\/swagger-/, /^\/public/] }));
  app.use(protectedRouter.routes()).use(protectedRouter.allowedMethods());
  
  cron.start();
  
  app.listen(config.port, () => {
    console.log(`app is running ${config.port}`);
  });

}).catch((error: string) => console.log("database connection error: ", error));
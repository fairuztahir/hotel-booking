import dotenv from "dotenv";

dotenv.config({ path: ".env" });

export interface Config {
    port: number;
    debugLogging: boolean;
    dbsslconn: boolean;
    jwtSecret: string;
    databaseUrl: string;
    dbEntitiesPath: string[];
    cronJobExpression: string;
}

const isDevMode = process.env.NODE_ENV == "development";
const databaseURL = `postgres://${process.env.POSTGRES_USER || "user"}:${process.env.POSTGRES_PASSWORD || "password"}@${process.env.POSTGRES_HOST || "localhost"}:5432/${process.env.POSTGRES_DB || "db"}`;

const config: Config = {
    port: +(process.env.PORT || 3000),
    debugLogging: isDevMode,
    dbsslconn: !isDevMode,
    jwtSecret: process.env.JWT_SECRET || "your-secret-whatever",
    databaseUrl: databaseURL,
    dbEntitiesPath: [
      ... isDevMode ? ["src/entities/**/*.ts"] : ["dist/entities/**/*.js"],
    ],
    cronJobExpression: "0 * * * *"
};

export { config };
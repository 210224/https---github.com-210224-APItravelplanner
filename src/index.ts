import "dotenv/config";
import { DestinationController } from "./controllers/destination.controller.js";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

if (!process.env.DB_URL) {
    console.error("cannot find mongodb url");
    console.error(
        "please add mongodb url in enviroment variable as DB_URL=<connection string here>"
    );
    process.exit(1);
}
const dbUrl = process.env.DB_URL;

let port: number = 3000;
if (process.env.PORT) {
    port = +process.env.PORT;
}

async function main() {
    await mongoose.connect(dbUrl);
    console.log("connected to database!");
    const app = express();
    // middlewares
    app.use(cors());
    app.use(express.json());
    app.use(
        express.urlencoded({
            extended: true,
        })
    );
    const destinationController = new DestinationController();
    app.use(destinationController.router);
    // uncomment this code to enable auth
    app.listen(port);
}

main();

const express = require("express");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const userRouter = require("./routes/userRoutes");
const app = express();
const { Server } = require("ws");

dotenv.config({ path: "./config.env" });
app.use(cors());
app.options("*", cors());

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);
app.use(express.json());
app.use(xss());

process.on("uncaughtException", (err) => {
    console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    process.exit(1);
});

//DB CONNECTION
console.log(process.env.DATABASE_LOCAL);
mongoose.connect(process.env.DATABASE_LOCAL);
mongoose.connection.on("connected", () =>
    console.log("connected to database successfully")
);

//ROUTE
app.use("/api/v1/users", userRouter);

//IF NO ROUTE FOUND
app.all("*", (req, res, next) => {
    res.status(404).json({
        status: "fail",
        message: `Can't find ${req.originalUrl} on this server`,
    });
    next();
});

//SERVER
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`app running on port ${port}...`);
});

const ws_server = new Server({ server });
ws_server.on("connection", (ws) => {
    console.log("New client connected!");

    ws.on("close", () => console.log("Client has disconnected!"));
});
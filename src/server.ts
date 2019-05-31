import express, { Application, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import path from "path";
import config from "config";
import logger from "./middleware/logger";

const app: Application = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

// Use logger Middleware
app.use(logger);

// Bodyparser Middleware
app.use(express.json());

// DB Config
const db: string = config.get("mongoURI");

// Connect to Mongo
//mongoose.set("debug", true);
mongoose.pluralize((collectionName: string) => collectionName);
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true
  }) // Adding new mongo url parser
  .then(() => console.log("MongoDB Connected."))
  .catch((err: any) => console.log(err));

// Use Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));

  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

io.on('connection', (socket: any) => {
  console.log('user connected');

  socket.on('offer', (data: any) => {
    socket.broadcast.emit('offer', data);
  });

  socket.on('initiate', () => {
    io.emit('initiate');
  });
})

const port = process.env.PORT || 5025;

app.listen(port, () => console.log(`Server started on port ${port}`));

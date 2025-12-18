const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const CommentRouter = require("./routes/CommentRouter");
const AdminRouter = require("./routes/AdminRouter");

dbConnect();

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(
  session({
    secret: "photo-sharing-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/api/user", UserRouter);
app.use("/api/photo", PhotoRouter);
// app.use("/api/admin", AdminRouter);

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(8080, () => {
  console.log("server listening on port 8080");
});

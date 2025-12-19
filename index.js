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
const corsOptions = {
  origin: "https://gwzv9z-3000.csb.app", // link front-end
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Cho phép nhận cookie/session
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(
  session({
    secret: "photo-sharing-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: "none", // Bắt buộc cho môi trường sandbox/khác domain
      secure: true, // Bắt buộc khi dùng sameSite: "none"
    },
  })
);

app.use("/api/user", UserRouter);
app.use("/api/photo", PhotoRouter);
app.use("/api/admin", AdminRouter);

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(8080, () => {
  console.log("server listening on port 8080");
});

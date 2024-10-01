require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const http = require("http");

const app = express();
const server = http.createServer(app);
const session = require("express-session");


app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static('uploads'));

require("./app/app")(app);
require("./db/connect");

server.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

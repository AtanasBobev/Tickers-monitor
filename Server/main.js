const express = require("express");
const {
  pool,
  InsertWSData,
  GetTickers,
  UserTickers,
  ResetPassword,
  Register,
  Login,
  getColors,
  changeColor,
  authenticate,
  getUser,
  history,
  File,
} = require("./src/postgres.js");
const { getToken, authenticateToken } = require("./src/json-web-token.js");
let {
  webSocket,
  dataFinal,
  AllTickers,
  forbiddenData,
  setUserTickers,
} = require("./src/web-socket.js");
const { swaggerDocs, swaggerOptions } = require("./src/swagger");
const swaggerUi = require("swagger-ui-express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cors = require("cors");
const fileUpload = require("express-fileupload");
let server = express();
const csv = require("csvtojson");
const fs = require("fs");
webSocket();
server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//Web socket thingy

//JWT verification

//Register
server.use(cors());
server.use(bodyParser.urlencoded());
server.use(bodyParser.json());

server.post("/register", async (req, res) => {
  if (!(req.body.email && req.body.password && req.body.password.length >= 7)) {
    return res.status(400).send({ error: "Data invalid" });
  }
  let pass = await bcrypt.hash(req.body.password, 10);
  Register(req, res, pass);
});

server.post("/login", async (req, res) => {
  if (!(req.body.email && req.body.password)) {
    return res.status(400).send({ error: "Data invalid" });
  }
  Login(req, res);
});

// get/tickers, post/tickers, delete /tickers use JWT as an authentication
server.get("/tickers", async (req, res) => {
  if (!req.headers.jwt) {
    res.status(401).send("No JWT sent");
    return false;
  }
  user = authenticateToken(req.headers.jwt);
  if (user) {
    let test = [];
    GetTickers(res, user, test, setUserTickers);
    console.log("test ", test);
  } else {
    res.status(401).send("You have not authorized yourself!");
  }
});
server.get("/colors", async (req, res) => {
  if (!req.headers.jwt) {
    res.status(401).send("No JWT sent or no color data sent");
    return false;
  }
  user = await authenticateToken(req.headers.jwt);
  if (!user) {
    res.status(401).send("Invalid JWT");
    return false;
  }
  getColors(req, res);
});
server.post("/colors", async (req, res) => {
  if (!(req.body.color && req.headers.jwt)) {
    res.status(401).send("No JWT sent or no color data sent");
    return false;
  }
  user = await authenticateToken(req.headers.jwt);
  if (!user) {
    res.status(401).send("Invalid JWT");
    return false;
  }
  changeColor(req, res);
});
server.post("/tickers", (req, res) => {
  if (!(req.body.ticker && req.headers.jwt)) {
    res.status(401).send("No JWT sent");
    return false;
  }
  user = authenticateToken(req.headers.jwt);
  if (user) {
    //Get the user id
    let id;
    authenticate(req, res);
  } else {
    res.status(401).send("You have not authorized yourself!");
  }
});

server.delete("/tickers", (req, res) => {
  if (!(req.headers.jwt && req.body.ticker)) {
    res.status(401).send("No JWT sent");
    return false;
  }
  user = authenticateToken(req.headers.jwt);
  if (user) {
    //Get the user id
    let id;
    getUser(user, req, res);
  } else {
    res.status(401).send("You have not authorized yourself!");
  }
});
//Load Historic data We get from the ticker_id, jwt, hours
let historicData;
server.post("/history", (req, res1) => {
  let UserTickersID;
  //hours
  if (!req.headers.jwt) {
    res.status(401).send("No JWT sent");
    return false;
  }
  if (!authenticateToken(req.headers.jwt)) {
    return false;
  }
  if (!req.body.hours && req.body.ticker_id) {
    console.log("No date supplied");
    return false;
  }
  user = authenticateToken(req.headers.jwt);
  if (user) {
    history(req, res1, user);
  } else {
    res1.status(401).send("You have not authorized yourself!");
  }
});
server.post(
  "/file",
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  }),
  (req, res1) => {
    if (!(req.files && authenticateToken(req.headers.jwt) && req.body.ticker)) {
      res1
        .status(400)
        .send(
          "Either you have not attached a file or no ticker is provided or no valid JWT is provided"
        );
      return false;
    }
    if (req.files.SomeFile.name.lastIndexOf(".csv") == -1) {
      res1.status(415).send("Invalid data format");
      return false;
    }

    req.files.SomeFile.mv("./tmp/" + req.files.SomeFile.name);
    csv()
      .fromFile(`./tmp/${req.files.SomeFile.name}`)
      .then(async (jsonObj) => {
        jsonObj.map((data) => {
          File(req, res1, data);
        });
      })
      .then(() => {
        fs.unlinkSync(`./tmp/${req.files.SomeFile.name}`);
        res1.status(200).send("Data inserted successfully!");
      });
  }
);
server.post("/changePassword", (req, res) => {
  console.log(req.body);

  if (
    !(
      req.body.newPassword &&
      authenticateToken(req.headers.jwt) &&
      req.body.oldPassword
    )
  ) {
    res
      .status(400)
      .send("Either no passwords are provided or no JWT is provided");
    return false;
  }
  ResetPassword(req, res);
});
server.listen(5000, () => {
  console.log("The server is up");
});

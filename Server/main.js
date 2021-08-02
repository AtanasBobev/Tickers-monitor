const express = require("express");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cors = require("cors");
const moment = require("moment");
const WebSocket = require("ws");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const fileUpload = require("express-fileupload");
let server = express();
const csv = require("csvtojson");
const fs = require("fs");

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Tickers",
      description: "Tickers allows you to get data about your favorite tickers",
      contact: {
        name: "Atanas Bobev",
      },
      servers: ["http://localhost:5000"],
    },
  },
  apis: ["main.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const io = require("socket.io")(4000, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "Task",
  password: "1234",
  port: "5432",
});

//Web socket thingy
let info = {
  LTCUSD: 0,
  BCHUSD: 0,
  DOTUSDT: 0,
  ETHUSD: 0,
};
try {
  const ws = new WebSocket(
    "wss://www.bitmex.com/realtime?subscribe=instrument:LTCUSD,instrument:BCHUSD,instrument:DOTUSDT,instrument:ETHUSD"
  );

  ws.on("error", (data) => {
    console.log("WS Error handled");
  });

  ws.on("message", function incoming(data) {
    let dataParsed = JSON.parse(data);
    io.emit("message", dataFinal());

    try {
      if (dataParsed.data[0].symbol && dataParsed.data[0].midPrice) {
        info[dataParsed.data[0].symbol] = dataParsed.data[0].midPrice;
        pool.query(
          `SELECT "id" FROM tickers where symbol=$1`,
          [dataParsed.data[0].symbol],
          (err, res) => {
            if (!err) {
              pool.query(
                `insert into ticker_data(ticker_id,"at",price) values ($1,$2,$3)`,
                [res.rows[0].id, new Date(), dataParsed.data[0].midPrice],
                (err, data) => {
                  if (err) {
                    console.log(err);
                  }
                }
              );
            }
          }
        );
      }
    } catch (err) {
      console.log(
        "Did not receive adequate response from the web socket. Error handled."
      );
    }
  });
} catch (err) {
  console.log("WS try: ", err);
}

//JWT verification
const getToken = (username) => {
  return jwt.sign({ user: username }, "my_very_big_secret", {
    expiresIn: "30d",
  });
};
const authenticateToken = (token) => {
  return jwt.verify(token, "my_very_big_secret", (err, decoded) => {
    if (err) {
      console.log(err);
      return false;
    } else {
      return decoded.user;
    }
  });
};

//Register
server.use(cors());
// TODO check if required
server.use(bodyParser.urlencoded());
server.use(bodyParser.json());

/**
 * @swagger
 *
 * securitySchemes:
 *   bearerAuth:            # arbitrary name for the security scheme
 *     type: http
 *     scheme: bearer
 *     bearerFormat: JWT    # optional, arbitrary value for documentation purposes
 * security:
 * - bearerAuth: []   
 * /register:
 *  post:
 *    description: Creates a new user
 *    responses:
 *      '200':
 *       description:User was created successfully
 *      '500':
 *       description:Internal server error. Most often means that the user with the same credentials already exists in the database.
 * /login:
 *  post:
 *    description: Logges in user
 *    responses:
 *      '200':
 *        description:User authenticated successfully
 * /tickers:
 *  get:
 *    description: Get user tickers
 *    responses:
 *      '200':
 *       description:Tickers returned succesfully
 *      '401':
 *       description:No JWT sent
 *      '403':
 *       description:You have no access to this ticker
 *  post:
 *     description: Adds a ticker
 *     responses:
 *       '200':
 *        description:Ticker added succesfully
 *       '401':
 *        description:No JWT sent
 *  delete:
 *     description: Delete user tickers
 *     responses:
 *       '200':
 *        description:Tickers sent
 *       '401':
 *        description:No JWT sent
 * /history:
 *  post:
 *    description: Get historic information about a ticker
 *    responses:
 *        '200':
 *         description:Ticker data sent
 *        '401':
 *         description:No JWT sent
 *    BearerAuth:
 *      type: http
        scheme: bearer
 */

server.post("/register", async (req, res) => {
  if (!(req.body.email && req.body.password && req.body.password.length >= 7)) {
    return res.status(400).send({ error: "Data invalid" });
  }
  let pass = await bcrypt.hash(req.body.password, 10);
  pool.query(
    "INSERT INTO users(email,hash) values ($1,$2)",
    [req.body.email, pass],
    (err, result) => {
      if (err) {
        console.log("Couldn't enter values in the database because:" + err);
        res.status(500).send("Internal server error");
      } else {
        res.status(200).send({ JWT: getToken(req.body.email) });
      }
      res.end;
    }
  );
});

server.post("/login", async (req, res) => {
  if (!(req.body.email && req.body.password)) {
    return res.status(400).send({ error: "Data invalid" });
  }
  pool.query(
    "SELECT * from users where email = $1",
    [req.body.email],
    async (err, result) => {
      let validity = await bcrypt.compare(
        req.body.password,
        result.rows[0].hash
      );
      if (validity) {
        res.status(200).send({ JWT: getToken(req.body.email) });
      } else {
        res.status(400).send("The data provided is invalid");
      }
    }
  );
});
let AllTickers = [],
  UserTickers = [],
  forbiddenData = [];
const dataFinal = () => {
  if (AllTickers.length && UserTickers.length) {
    let object = info;
    forbiddenData = AllTickers.filter((data) => !UserTickers.includes(data));
    forbiddenData.forEach(function (v) {
      delete object[v];
    });
    return object;
  } else {
    return false;
  }
};
pool.query("select symbol from tickers", (err, data) => {
  if (!err) {
    for (let val of data.rows) {
      AllTickers.push(val.symbol);
    }
  } else {
    console.log(err);
  }
});
// get/tickers, post/tickers, delete /tickers use JWT as an authentication
server.get("/tickers", async (req, res) => {
  userTickers = [];
  if (!req.headers.jwt) {
    res.status(401).send("No JWT sent");
    return false;
  }
  user = authenticateToken(req.headers.jwt);
  if (user) {
    pool.query(
      `SELECT email,ticker_id,symbol,"name" FROM public.user_tickers
join users on users.id = user_tickers.user_id
join tickers on tickers.id = user_tickers.ticker_id
where email = $1`,
      [user],
      (err, data) => {
        res.status(200).send({ rows: data.rows });
        UserTickers = data.rows.map((data) => {
          return data.symbol;
        });
        console.log(UserTickers);
      }
    );
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
  pool.query("Select data from users where email = $1", [user], (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal server error");
      return false;
    }
    console.log(data.rows[0]);
    res.status(200).send(data.rows[0]);
  });
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
  pool.query(
    "UPDATE users SET data=$1 where email=$2",
    [req.body.color, user],
    (err, data) => {
      if (err) {
        res.status(500).send("Internal server error");
        console.log(err);
        return false;
      }
      res.status(200).send("Data modified successfully");
    }
  );
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
    pool.query(
      `select "id" from users where email = $1`,
      [user],
      (err, data) => {
        if (err) {
          res.status(500).send("There was an internal error");
        } else {
          id = data.rows[0].id;
          pool.query(
            `insert into user_tickers(user_id,ticker_id) values ($1,$2) `,
            [id, req.body.ticker],
            (err, data) => {
              if (err) {
                res.status(500).send("There was an internal error");
              } else {
                res.status(200).send("Data entered");
              }
            }
          );
        }
      }
    );
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
    pool.query(
      `select "id" from users where email = $1`,
      [user],
      (err, data) => {
        if (err) {
          res.status(500).send("There was an internal error");
        } else {
          id = data.rows[0].id;
          pool.query(
            `DELETE FROM public.user_tickers
	WHERE user_id = $1 AND ticker_id = $2`,
            [id, req.body.ticker],
            (err, data) => {
              if (err) {
                res.status(500).send("There was an internal error");
              } else {
                res.status(200).send("Data deleted successfully");
              }
            }
          );
        }
      }
    );
  } else {
    res.status(401).send("You have not authorized yourself!");
  }
});
//Load Historic data We get from the ticker_id, jwt, hours
let historicData;
server.post("/history", async (req, res1) => {
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
    await pool.query(
      `SELECT email,ticker_id,symbol,"name" FROM public.user_tickers
join users on users.id = user_tickers.user_id
join tickers on tickers.id = user_tickers.ticker_id
where email = $1`,
      [user],
      (err, data) => {
        UserTickersID = data.rows.map((data) => {
          return data.ticker_id;
        });
        if (!UserTickersID.includes(req.body.ticker_id)) {
          res1.status(403).send("You have no access to this ticker!");
          return false;
        } else {
          pool.query(
            `Select price,"at" from ticker_data where "at">$1 and ticker_id=$2  and "id" % 100 = 0`,
            [
              moment(Date.now() - req.body.hours * 3600 * 1000).format(
                "YYYY-MM-DD"
              ),
              req.body.ticker_id,
            ],
            (err, res) => {
              if (err) {
                console.log(err);
                return false;
              }
              let chartData = [],
                historicData = [];
              for (let [key, value] of Object.entries(res.rows)) {
                chartData = [];
                for (let [key1, value1] of Object.entries(value)) {
                  console.log(value1);
                  if (Number(value1)) {
                    chartData.push(Number(value1));
                  } else {
                    chartData.push(value1);
                    console.log(value1);
                  }
                }
                historicData.push(chartData.reverse());
                console.log(chartData);
              }
              res1.status(200).send(historicData);
            }
          );
        }
      }
    );
  } else {
    res.status(401).send("You have not authorized yourself!");
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
          pool.query(
            `insert into ticker_data(ticker_id,"at",price) values ($1,$2,$3)`,
            [req.body.ticker, data.DatePub, data.Price],
            (err, data) => {
              if (err) {
                console.log(err);
                res1.status(500).send("Internal server error");
                return false;
              }
            }
          );
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
  pool.query(
    "SELECT * from users where email = $1",
    [authenticateToken(req.headers.jwt)],
    async (err, result) => {
      let validity = await bcrypt.compare(
        req.body.oldPassword,
        result.rows[0].hash
      );
      if (validity) {
        let pass = await bcrypt.hash(req.body.newPassword, 10);
        pool.query(
          "UPDATE users SET hash=$2 where email=$1",
          [authenticateToken(req.headers.jwt), pass],
          (err, data) => {
            if (err) {
              console.log(err);
              res.status(500).send("Internal server error");
              return false;
            }
            console.log(data);
            res.status(200).send("Password change successfully");
          }
        );
      } else {
        res.status(400).send("The data provided is invalid");
      }
    }
  );
});
server.listen(5000, () => {
  console.log("The server is up");
});

const { Pool } = require("pg");
const { getToken, authenticateToken } = require("./json-web-token");
const bcrypt = require("bcrypt");
const moment = require("moment");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "Task",
  password: "1234",
  port: "5432",
});
const InsertWSData = (dataParsed) => {
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
};
let UserTickers = [];

const GetTickers = async (res, user, tickers, setUserTickers) => {
  pool.query(
    `SELECT email,ticker_id,symbol,"name" FROM public.user_tickers
join users on users.id = user_tickers.user_id
join tickers on tickers.id = user_tickers.ticker_id
where email = $1`,
    [user],
    (err, data) => {
      if (err) {
        console.log(err);
        return false;
      }
      res.status(200).send({ rows: data.rows });
      UserTickers = [];
      UserTickers = data.rows.map((data) => {
        return data.symbol;
      });
      console.log("User tickers are", UserTickers);
      tickers = UserTickers;
      setUserTickers(tickers);
      return UserTickers;
    }
  );
};
const ResetPassword = (req, res) => {
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
};
const Register = (req, res, pass) => {
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
};
const Login = (req, res) => {
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
};
const getColors = (req, res) => {
  pool.query("Select data from users where email = $1", [user], (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal server error");
      return false;
    }
    console.log(data.rows[0]);
    res.status(200).send(data.rows[0]);
  });
};
const changeColor = (req, res) => {
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
};
const authenticate = (req, res) => {
  pool.query(`select "id" from users where email = $1`, [user], (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("There was an internal error");
    } else {
      id = data.rows[0].id;
      pool.query(
        `insert into user_tickers(user_id,ticker_id) values ($1,$2) `,
        [id, req.body.ticker],
        (err, data) => {
          if (err) {
            console.log(err);
            res.status(500).send("There was an internal error");
          } else {
            res.status(200).send("Data entered");
          }
        }
      );
    }
  });
};
const getUser = (user, req, res) => {
  pool.query(`select "id" from users where email = $1`, [user], (err, data) => {
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
  });
};
const history = (req, res1, user) => {
  pool.query(
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
};
const File = (req, res1, data) => {
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
};
module.exports = {
  pool,
  InsertWSData,
  UserTickers,
  GetTickers,
  ResetPassword,
  Register,
  Login,
  getColors,
  changeColor,
  authenticate,
  getUser,
  history,
  File,
};

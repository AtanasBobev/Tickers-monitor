const WebSocket = require("ws");
let { pool, InsertWSData, GetTickers, UserTickers } = require("./postgres.js");
let info = {
  LTCUSD: 0,
  BCHUSD: 0,
  DOTUSDT: 0,
  ETHUSD: 0,
};
const io = require("socket.io")(4000, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});
let AllTickers = [],
  forbiddenData = [];
let userTickers = [];

const setUserTickers = (tickers) => {
  userTickers = tickers;
  console.log(tickers);
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
const dataFinal = () => {
  if (AllTickers.length && userTickers.length) {
    let object = info;
    forbiddenData = AllTickers.filter((data) => !userTickers.includes(data));
    forbiddenData.forEach(function (v) {
      delete object[v];
    });
    return object;
  } else {
    return false;
  }
};
const webSocket = () => {
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
          InsertWSData(dataParsed);
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
};
module.exports = {
  webSocket,

  AllTickers,
  forbiddenData,
  setUserTickers,
};

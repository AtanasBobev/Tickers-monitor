import React from "react";
import AnimatedNumber from "animated-number-react";
import ReactCircleModal from "react-circle-modal";
import { Chart } from "react-google-charts";

const List = (props) => {
  const [selectedTicker, updateSelectedTicker] = React.useState(1);
  const HandleTicker = (e) => {
    updateSelectedTicker(e.target.value);
  };
  //const columns = ["Date", "Price"];
  return (
    <div style={{ backgroundColor: props.color }} className="center">
      <div className="mb-3 row centerData">
        <select className="form-select" onChange={HandleTicker}>
          <option value="1">DOTUSDT</option>
          <option value="2">LTCUSD</option>
          <option value="3">ETHUSD</option>
          <option value="4">BCHUSD</option>
        </select>
        <button
          className="btn btn-success add"
          onClick={() => {
            props.addTicker(selectedTicker);
          }}
        >
          +
        </button>
      </div>
      {props.tickers
        ? props.tickers.map((data) => {
            return (
              <div key={data.ticker_id} className="row">
                <p
                  onClick={() => {
                    props.deleteTicker(data.ticker_id);
                  }}
                  title={data.name}
                >
                  {data.symbol}
                </p>
                <div>
                  Price: $
                  <AnimatedNumber
                    value={props.tickersData[data.symbol]}
                  ></AnimatedNumber>
                </div>
                <ReactCircleModal
                  backgroundColor="white"
                  toogleComponent={(onClick) => (
                    <div
                      onClick={() => {
                        props.history(data.ticker_id, 6);
                      }}
                    >
                      <button
                        className="btn btn-outline-warning special"
                        onClick={onClick}
                      >
                        More
                      </button>
                    </div>
                  )}
                  offsetX={0}
                  offsetY={0}
                >
                  {(onClick) => (
                    <div
                      style={{ backgroundColor: "transparent", padding: "1em" }}
                    >
                      <h1 className="shadowy">{data.name}</h1>
                      <Chart
                        className="chart"
                        chartType="ComboChart"
                        loader={<div>Loading chart...</div>}
                        data={[["Date", "Price"], ...props.historicData]}
                        options={{
                          pointSize: 9,
                          curveType: "function",
                          // Material design options
                          hAxis: { title: "Date" },
                          vAxis: { title: "Price" },
                        }}
                        rootProps={{ "data-testid": "1" }}
                      />
                      <div
                        onChange={(e) => {
                          props.history(data.ticker_id, e.target.value);
                        }}
                        className="btn-group"
                        role="group"
                        aria-label="Basic radio toggle button group"
                      >
                        <input
                          value="1"
                          type="radio"
                          className="btn-check"
                          name="btnradio"
                          id="btnradio1"
                        />
                        <label
                          className="btn btn-outline-primary"
                          htmlFor="btnradio1"
                        >
                          1 hour
                        </label>

                        <input
                          value="6"
                          type="radio"
                          className="btn-check"
                          name="btnradio"
                          id="btnradio2"
                        />
                        <label
                          className="btn btn-outline-primary"
                          htmlFor="btnradio2"
                        >
                          6 hours
                        </label>

                        <input
                          value="12"
                          type="radio"
                          className="btn-check"
                          name="btnradio"
                          id="btnradio3"
                        />
                        <label
                          className="btn btn-outline-primary"
                          htmlFor="btnradio3"
                        >
                          12 hours
                        </label>
                        <input
                          value="24"
                          type="radio"
                          className="btn-check"
                          name="btnradio"
                          id="btnradio4"
                        />
                        <label
                          className="btn btn-outline-primary"
                          htmlFor="btnradio4"
                        >
                          1 day{" "}
                        </label>

                        <input
                          value="168"
                          type="radio"
                          className="btn-check"
                          name="btnradio"
                          id="btnradio5"
                        />
                        <label
                          className="btn btn-outline-primary"
                          htmlFor="btnradio5"
                        >
                          7 days{" "}
                        </label>

                        <input
                          value="730"
                          type="radio"
                          className="btn-check"
                          name="btnradio"
                          id="btnradio6"
                        />
                        <label
                          className="btn btn-outline-primary"
                          htmlFor="btnradio6"
                        >
                          1 month{" "}
                        </label>
                        <input
                          value="8760"
                          type="radio"
                          className="btn-check"
                          name="btnradio"
                          id="btnradio7"
                        />
                        <label
                          className="btn btn-outline-primary"
                          htmlFor="btnradio7"
                        >
                          1 year
                        </label>

                        <input
                          value="999999"
                          type="radio"
                          className="btn-check"
                          name="btnradio"
                          id="btnradio8"
                        />
                        <label
                          className="btn btn-outline-primary"
                          htmlFor="btnradio8"
                        >
                          All
                        </label>
                      </div>
                      <button
                        className="btn btn-danger close"
                        onClick={onClick}
                      >
                        Close
                      </button>
                    </div>
                  )}
                </ReactCircleModal>
              </div>
            );
          })
        : "Waiting htmlFor data..."}
    </div>
  );
};
export default List;

/* eslint-disable eqeqeq */
import React from "react";
import axios from "axios";
import Register from "./Components/register";
import Login from "./Components/login";
import List from "./Components/list";
import "./App.css";
import validator from "validator";
import io from "socket.io-client";
import ReactCircleModal from "react-circle-modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [logState, setLogState] = React.useState(1);
  const [tickers, setTickers] = React.useState([]);
  const [tickersData, setTickersData] = React.useState({});
  const [historicData, setHistoricData] = React.useState([]);
  const [uploadData, saveUploadData] = React.useState();
  const [tickerUpload, tickerToUpload] = React.useState(1);
  const [currentPass, setCurrentPassword] = React.useState();
  const [NewPassword, setNewPassword] = React.useState();
  const [NewPassword2, setNewPassword2] = React.useState();
  const [color, setColor] = React.useState();
  const synchronizeColor = (e) => {
    axios
      .post(
        "http://localhost:5000/colors",
        { color: color },
        { headers: { jwt: localStorage.getItem("JWT") } }
      )
      .then((data) => console.log(data));
  };
  const GetColors = () => {
    axios
      .get("http://localhost:5000/colors", {
        headers: { jwt: localStorage.getItem("JWT") },
      })
      .then((data) => setColor(data.data.data));
  };

  const ChangePass = () => {
    if (NewPassword !== NewPassword2) {
      toast.warn("Ops! Passwords do no match", {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return false;
    }
    if (NewPassword.length < 7) {
      toast.warn("Your password must be at least 7 characters long!", {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return false;
    }
    axios
      .post(
        "http://localhost:5000/changePassword",
        {
          oldPassword: currentPass,
          newPassword: NewPassword,
        },
        {
          headers: {
            jwt: localStorage.getItem("JWT"),
          },
        }
      )
      .then((data) => {
        if (data.status == 200) {
          toast.dark("Password updated successfully!", {
            position: "bottom-left",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      })
      .catch((err) => {
        toast.error("Ops! Wrong password", {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      });
  };

  const setChoice = (e) => {
    console.log(e.target.value);
    tickerToUpload(e.target.value);
  };
  const setFile = (e) => {
    console.log(e.target.files[0]);
    saveUploadData(e.target.files[0]);
  };
  const uploadToServer = () => {
    console.log(saveUploadData);
    const data = new FormData();
    data.append("SomeFile", uploadData);
    data.append("ticker", tickerUpload);
    axios
      .post(
        "http://localhost:5000/file",
        data,
        { headers: { JWT: localStorage.getItem("JWT") } },
        {
          // receive two    parameter endpoint url ,form data
        }
      )
      .then((res) => {
        if (res.status) {
          toast.dark("Data uploaded successfully", {
            position: "bottom-left",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error(
          "There was an error uploading the data. Check your file extension and mind the 50mb per file limit!",
          {
            position: "bottom-left",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          }
        );
      });
  };

  window.onload = () => {
    const socket = io("http://localhost:4000");
    socket.on("message", (data) => {
      if (data) {
        setTickersData(data);
      }
    });
    GetColors();
    if (localStorage.getItem("JWT")) {
      setTickers([]);
      getTickers();
      setLogState(3);
    }
  };
  //Log state 1 --> register
  //Log state 2 --> login
  //Log state 3 --> token exists, both register and login can be hidden/log out button appears

  const history = (e, hoursData) => {
    console.log("The requested ticker is: " + e);
    axios
      .request("http://localhost:5000/history", {
        method: "POST",
        headers: {
          JWT: localStorage.getItem("JWT"),
        },
        data: {
          ticker_id: e,
          hours: hoursData,
        },
      })
      .then((data) => {
        let final = data.data;
        console.log(final);
        setHistoricData(final);
        toast.dark("Data received successfully!", {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      })
      .catch((err) => {
        toast.error(
          "There was an error getting you the data. Maybe the server is down. Try again in a few minutes!",
          {
            position: "bottom-left",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          }
        );
      });
  };
  const register = (e) => {
    e.preventDefault();
    if (!validator.isEmail(e.currentTarget.username.value)) {
      toast.warn("You have not entered an email!", {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return false;
    }
    axios
      .request("http://localhost:5000/register", {
        method: "POST",
        data: {
          email: e.currentTarget.username.value,
          password: e.currentTarget.password.value,
        },
      })
      .then((data) => {
        if (data.status === 200 && data.data.JWT) {
          localStorage.setItem("JWT", data.data.JWT);
          setLogState(3);
        }
      });
  };
  const login = (e) => {
    e.preventDefault();
    if (!validator.isEmail(e.currentTarget.username.value)) {
      toast.warn("You have not entered an email!", {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return false;
    }
    if (e.currentTarget.password.value.length < 7) {
      toast.warn("Your password must be at least 7 characters long!", {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    axios
      .request("http://localhost:5000/login", {
        method: "POST",
        data: {
          email: e.currentTarget.username.value,
          password: e.currentTarget.password.value,
        },
      })
      .then((data) => {
        if (data.status === 200 && data.data.JWT) {
          localStorage.setItem("JWT", data.data.JWT);
          setLogState(3);
          getTickers();
        }
      })
      .catch((err) =>
        toast.error("Wrong email or password!", {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
      );
  };
  const getTickers = () => {
    axios
      .get("http://localhost:5000/tickers", {
        headers: {
          jwt: localStorage.getItem("JWT"),
        },
      })
      .then((data) => {
        setTickers(data.data.rows);
      })
      .catch((err) => {
        toast.error(
          "Could not retrieve your data. Maybe the server is offline.",
          {
            position: "bottom-left",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          }
        );
        setLogState(2);
      });
  };
  React.useEffect(() => {
    try {
      document
        .getElementById("exampleColorInput")
        .addEventListener("focus", function () {
          // if(tog === true){
          console.log("open");
          // }else{
          //     console.log('closed');
          // }
        });
    } catch (err) {
      console.log(err);
    }
  }, []);
  const deleteTicker = (id) => {
    axios
      .request("http://localhost:5000/tickers", {
        headers: {
          jwt: localStorage.getItem("JWT"),
        },
        method: "DELETE",
        data: {
          ticker: id,
        },
      })
      .then((data) => {
        if (data.status === 200) {
          setTickers(tickers.filter((data) => data.ticker_id !== id));
          getTickers();
        }
      });
  };
  const addTicker = (id) => {
    if (tickers.some((el) => el.ticker_id == id)) {
      toast.warn("The ticker already exists", {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      axios
        .request("http://localhost:5000/tickers", {
          method: "POST",
          headers: {
            jwt: localStorage.getItem("JWT"),
          },
          data: {
            ticker: id,
          },
        })
        .then((data) => {
          if (data.status == 200) {
            getTickers();
          }
        });
    }
  };
  const Logout = () => {
    localStorage.removeItem("JWT");
    setLogState(2);
    setTickers([]);
  };

  return (
    <div>
      <div className="wrapper">
        <ToastContainer
          position="bottom-left"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <div style={{ backgroundColor: color }} className="menu">
          {logState == 3 ? (
            <ReactCircleModal
              backgroundColor="white"
              toogleComponent={(onClick) => (
                <div>
                  <label onClick={onClick}>Change theme</label>
                </div>
              )}
              offsetX={0}
              offsetY={0}
            >
              {(onClick) => (
                <div style={{ backgroundColor: "transparent", padding: "1em" }}>
                  <div>
                    <h1 className="shadowy">Change theme</h1>
                    <label for="exampleColorInput" class="form-label">
                      Choose a new color!
                    </label>
                    <input
                      onChange={(e) => {
                        setColor(e.target.value);
                        synchronizeColor(e.target.value);
                      }}
                      type="color"
                      class="form-control form-control-color"
                      id="exampleColorInput"
                      title="Choose your color"
                    ></input>
                  </div>
                  <button className="btn btn-danger close" onClick={onClick}>
                    Close
                  </button>
                </div>
              )}
            </ReactCircleModal>
          ) : (
            ""
          )}
          {logState == 3 ? (
            <ReactCircleModal
              backgroundColor="white"
              toogleComponent={(onClick) => (
                <div>
                  <label onClick={onClick}>Upload Data</label>
                </div>
              )}
              offsetX={0}
              offsetY={0}
            >
              {(onClick) => (
                <div style={{ backgroundColor: "transparent", padding: "1em" }}>
                  <h1 className="shadowy">Upload data</h1>
                  <div className="mainUpload">
                    <label class="form-label">
                      1. Choose a file to be uploaded for data references
                    </label>
                    <input
                      class="form-control"
                      type="file"
                      name="file"
                      onChange={setFile}
                    />
                    <br></br>
                    <label>Choose the corresponding ticker</label>
                    <select
                      class="selectpicker"
                      className="htmlForm-select htmlFormclassName"
                      onChange={setChoice}
                    >
                      <option value="1">DOTUSDT</option>
                      <option value="2">LTCUSD</option>
                      <option value="3">ETHUSD</option>
                      <option value="4">BCHUSD</option>
                    </select>
                    <br></br>
                    <label class="form-label">
                      Click the button when you are ready
                    </label>
                    <button
                      onClick={uploadToServer}
                      className="btn btn-primary"
                    >
                      Upload
                    </button>
                  </div>
                  <button className="btn btn-danger close" onClick={onClick}>
                    Close
                  </button>
                </div>
              )}
            </ReactCircleModal>
          ) : (
            ""
          )}
          <div>
            {" "}
            {logState == 3 ? (
              <div>
                <ReactCircleModal
                  backgroundColor="white"
                  toogleComponent={(onClick) => (
                    <div>
                      <label onClick={onClick}>Change password</label>
                    </div>
                  )}
                  offsetX={0}
                  offsetY={0}
                >
                  {(onClick) => (
                    <div
                      style={{ backgroundColor: "transparent", padding: "1em" }}
                    >
                      <h1 className="shadowy">Change password</h1>
                      <div class="mb-3">
                        <label for="currentPassword" class="form-label">
                          Current password
                        </label>
                        <input
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          type="password"
                          class="form-control"
                          aria-describedby="Enter current password"
                        />
                      </div>
                      <div class="mb-3">
                        <label for="newPass" class="form-label">
                          New password
                        </label>
                        <input
                          onChange={(e) => setNewPassword(e.target.value)}
                          type="password"
                          class="form-control"
                          id="newPass"
                        />
                      </div>
                      <div class="mb-3">
                        <label for="newPass2" class="form-label">
                          New password again
                        </label>
                        <input
                          onChange={(e) => setNewPassword2(e.target.value)}
                          type="password"
                          class="form-control"
                          id="newPass2"
                        />
                      </div>
                      <button onClick={ChangePass} class="btn btn-primary">
                        Submit
                      </button>
                      <button
                        className="btn btn-danger close"
                        onClick={onClick}
                      >
                        Close
                      </button>
                    </div>
                  )}
                </ReactCircleModal>{" "}
              </div>
            ) : (
              ""
            )}
          </div>
          {logState == 3 ? (
            <button className="btn btn-outline-danger" onClick={Logout}>
              Log out
            </button>
          ) : (
            ""
          )}
        </div>
        {logState === 1 ? (
          <Register setLogState={setLogState} register={register} />
        ) : (
          ""
        )}
        {logState === 2 ? (
          <Login setLogState={setLogState} login={login} />
        ) : (
          ""
        )}
        {logState === 3 ? (
          <List
            color={color}
            historicData={historicData}
            history={history}
            tickersData={tickersData}
            addTicker={addTicker}
            deleteTicker={deleteTicker}
            tickers={tickers}
          />
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default App;

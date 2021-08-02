import React from "react";
const Login = (props) => {
  return (
    <form className="form" onSubmit={props.login}>
      <center>
        {" "}
        <h1>Login</h1>
      </center>
      <label className="form-label">Username</label>
      <br></br>
      <input
        className="form-control form-control-md"
        name="username"
        type="text"
        required
      ></input>
      <br />
      <label className="form-label">Password</label>
      <br></br>
      <input
        className="form-control form-control-md"
        name="password"
        type="password"
        required
      ></input>
      <br></br>
      <button className="btn btn-primary" type="submit">
        Submit
      </button>

      <button
        className="btn"
        onClick={() => {
          props.setLogState(1);
        }}
      >
        Register
      </button>
    </form>
  );
};

export default Login;

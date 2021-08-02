import React from "react";
const Register = (props) => {
  //useContent
  return (
    <div className="form">
      <form onSubmit={props.register}>
        <center>
          {" "}
          <h1>Register</h1>{" "}
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
            props.setLogState(2);
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Register;

const jwt = require("jsonwebtoken");
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
module.exports = { getToken, authenticateToken };

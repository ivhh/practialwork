const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "supersecreto";

function sign(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "1h" });
}

function verify(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = { sign, verify };
const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
    req.userId = decoded.id; // attach decoded user info
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = protect;

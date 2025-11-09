const { createServer } = require("http");
const app = require("./api/index");

const PORT = process.env.PORT || 3000;

createServer(app).listen(PORT, () => {
  console.log(`Dev server running on http://localhost:${PORT}`);
});

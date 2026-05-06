import express from "express";
import router from "./controllers/exchangeController.js";
import { init as exchangeInit } from "./exchange.js";

await exchangeInit();

const app = express();
const port = 3000;

app.use(express.json());

// mount controller router (keeps same routes)
app.use(router);

app.get("/who", (req, res) => {
  const payload = {
    hostname: os.hostname(),
    pid: process.pid,
    ts: new Date().toISOString(),
  };

  res
    .status(200)
    .type("application/json")
    .send(`${JSON.stringify(payload)}\n`);
});

app.listen(port, () => {
  console.log(`Exchange API listening on port ${port}`);
});

export default app;

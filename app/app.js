import express from "express";
import router from "./controllers/exchangeController.js";
import { init as exchangeInit } from "./exchange.js";

await exchangeInit();

const app = express();
const port = 3000;

app.use(express.json());

// mount controller router (keeps same routes)
app.use(router);

app.listen(port, () => {
  console.log(`Exchange API listening on port ${port}`);
});

export default app;

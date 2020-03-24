const express = require("express");
const cron = require("node-cron");
const request = require("request");
const mongoose = require("mongoose");
const cheerio = require("cheerio");
const app = express();
app.use(express.json());

mongoose.connect(
    "mongodb://10.0.0.120/covidgooglescrape",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  );

  const db = mongoose.connection;
  db.on("error", error => console.error(error));
  db.once("open", () => {
    console.log("Connected to Database");
  });

  let covidSchema = new mongoose.Schema({
    epoch: Number,
    data: Object
  });
  let Covid = mongoose.model("covids", covidSchema);

  const URL = "https://google.org/crisisresponse/covid19-map";








app.listen(5000, () => console.log(`listening`));

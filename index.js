const express = require("express");
const cron = require("node-cron");
const request = require("request");
const mongoose = require("mongoose");
const cheerio = require("cheerio");
const cheerioTableparser = require("cheerio-tableparser");
const app = express();
app.use(express.json());

mongoose.connect("mongodb://10.0.0.120/covidgooglescrape", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

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

cron.schedule("*/30 * * * *", async function() {
  console.log("\n----- Running Cron Job -----");
  //await doCron();
  console.log("----- Cron Job Finished -----");
});

function doGet(url) {
  return new Promise((resolve, reject) => {
    request(url, (error, response, body) => {
      if (error) reject(error);
      if (response.statusCode != 200) {
        reject("Invalid status code <" + response.statusCode + ">");
      }
      resolve(body);
    });
  });
}

const doThing = async () => {
  try {
    let currentData = {
      epoch: new Date().getTime(),
      datetime: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }).toString() + " IST",
      countries: []
    };
    const htmlData = await doGet(URL);

    const $ = cheerio.load(htmlData);

    cheerioTableparser($);
    data = $(".table_scroll , .table_height").parsetable(true, true, true);

    for (index in data[0]) {
      if (index != 0) {
        let county = {
          [data[0][index]]: {
            cases: data[1][index],
            deaths: data[4][index],
            recovered: data[3][index]
          }
        };

        currentData.countries.push(county);
      }
    }

    console.log(JSON.stringify(currentData));
  } catch (error) {
    console.error(error);
  }
};


app.listen(5000, async () => {
  console.log(`listening`), await doThing();
});

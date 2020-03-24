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
  await doCron();
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

let currentData = {
  epoch: null,
  datetime: "",
  countries: []
};

const doCron = async () => {
  try {
    console.log("----- Starting JOB -----");
    console.log(new Date().toLocaleString() + "\n");

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
        currentData.epoch = new Date().getTime();
        currentData.datetime =
          new Date()
            .toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
            .toString() + " IST";
        currentData.countries.push(county);
      }
    }

    let entry = new Covid({
      epoch: new Date().getTime(),
      data: JSON.parse(JSON.stringify(currentData))
    });
    try {
      await entry.save({ checkKeys: false });
      console.log("added to DB");
    } catch (err) {
      console.log("failed to add to DB ", err);
    }

    console.log("\n----- Ending JOB -----");

    //console.log(JSON.stringify(currentData));
  } catch (error) {
    console.error(error);
  }
};

app.get("/", (req, res) => {
  res.json(currentData);
});

app.get("/epoch", async (req, res) => {
  let data = [];
  let epo;
  try {
    epo = await Covid.find();
    epo.forEach(element => {
      data.push(element.epoch);
    });

    res.json({ epoch: data });
  } catch (error) {
    res.send(error).status(500);
  }
});

app.get("/epoch/:epo", async (req, res) => {
  const epo = req.params.epo;
  let data;
  try {
    data = await Covid.findOne({
      epoch: req.params.epo
    });

    if (data == null) {
      res
        .json({
          error: "epoch not found"
        })
        .status(404);
    } else {
      res.json(data);
    }
  } catch (error) {
    res.send("error" + error).status(500);
  }
});

app.listen(5000, async () => {
  console.log(`listening`);
  await doCron();
});

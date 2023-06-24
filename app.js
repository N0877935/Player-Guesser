require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const { log } = require("console");
const wiki = require("wikijs").default;
const date = require(__dirname + "/date.js");
const favicon = require('express-favicon');

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(favicon(__dirname + '/public/assets/football.png'));

const randId = Math.floor(Math.random() * 100);

const playerObj = {
  playerName: String,
  playerDates: [],
  playerTeams: [],
  playerApps: [],
  playerGoals: [],
  noOfGuesses: 0,
  playerGuesses: [],
  playerBoolean: Boolean
};

const regex = {
  years: /^years[1-5]$/,
  teams: /^clubs[1-5]$/,
  apps: /^caps[1-5]$/,
  goals: /^goals[1-5]$/
};

app.get("/", async (req, res) => {
  const day = date.getDate();
  const key = process.env.API_KEY;
  const url = `https://soccer.sportmonks.com/api/v2.0/players/${randId}?api_token=${key}`;

  try {
    const response = await getData(url);
    const randomPlayer = response.data.display_name;
    const page = await wiki().page(randomPlayer);
    const pageInfo = await page.info();

    playerObj.playerName = randomPlayer;
    populateObj(pageInfo, playerObj.playerDates, regex.years);
    populateObj(pageInfo, playerObj.playerTeams, regex.teams);
    populateObj(pageInfo, playerObj.playerApps, regex.apps);
    populateObj(pageInfo, playerObj.playerGoals, regex.goals);

    res.render("home", {
      playerObj,
      todayDate: day
    });
    console.log(playerObj);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/", (req, res) => {
  console.log(playerObj.playerName);

  const playerName = req.body.inputPlayer;
  if (playerName === playerObj.playerName) {
    console.log("Success");
    playerObj.playerBoolean = true;
    console.log(playerObj.playerBoolean);
  } else {
    console.log("Incorrect");

    playerObj.noOfGuesses++;
    console.log(playerObj.noOfGuesses);
    playerObj.playerGuesses.push(req.body.inputPlayer);
    playerObj.playerBoolean = false;
    console.log(playerObj.playerBoolean);
  }
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});

function populateObj(obj, array, regex) {
  Object.keys(obj)
    .filter((key) => key.match(regex))
    .forEach((key) => {
      if (array.includes(obj[key])) {
        console.log("Entry already exists!");
      } else {
        array.push(obj[key]);
        console.log("Entry pushed to array");
      }
    });
}

function getData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = "";
      response
        .on("data", (chunk) => {
          data += chunk;
        })
        .on("end", () => {
          const obj = JSON.parse(data);
          resolve(obj);
        })
        .on("error", (error) => {
          reject(error);
        })
      })})}
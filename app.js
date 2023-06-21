const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const { log } = require("console");
const wiki = require("wikijs").default;
const date = require(__dirname + "/date.js");

const app = express();

const port = 3000;

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const randId = Math.floor(Math.random() * 100);
let playerData;

// const playerDates = [];

const playerObj = {
  playerDates: [],
  playerTeams: [],
  playerApps: [],
  playerGoals: [],
};

const regex = {
  years: /^years[1-5]$/,
  teams: /^clubs[1-5]$/,
  apps: /^caps[1-5]$/,
  goals: /^goals[1-5]$/,
};

app.get("/", (req, res) => {
  const day = date.getDate();

  const key = "bn0t5U326A3ITj1QxP1ZHYyHeELIEEu91Q8Tjfhq3C7GvDFe4eMMATztxH40#";
  const url = `https://soccer.sportmonks.com/api/v2.0/players/${randId}?api_token=${key}`;

  https.get(url, (response) => {
    const data = [];
    response
      .on("data", (d) => {
        data.push(d);
      })
      .on("end", () => {
        const buffer = Buffer.concat(data);
        const obj = JSON.parse(buffer.toString());
        const randomPlayer = obj.data.display_name;

        wiki()
          .page(randomPlayer)
          .then((page) => page.info())
          .then((response) => {
            playerData = randomPlayer;
            res.render("home", {
              yearsOne: response.years1,
              teamOne: response.clubs1,
              appsOne: response.caps1,
              goalsOne: response.goals1,
              todayDate: day,
            });

            test(response, playerObj.playerDates, regex.years);
            test(response, playerObj.playerTeams, regex.teams);
            test(response, playerObj.playerApps, regex.apps);
            test(response, playerObj.playerGoals, regex.goals);
          });
      });
  });
});

app.post("/", (req, res) => {
  console.log(playerData);
  const playerName = req.body.inputPlayer;
  if (playerName === playerData) {
    console.log("Success");
  } else {
    console.log("Incorrect");
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});

function test(obj, array, regex) {
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

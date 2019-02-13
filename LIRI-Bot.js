require("dotenv").config();

var keys = require("./keys");

var Spotify = require("node-spotify-api");

var axios = require("axios");

var moment = require("moment");

var fs = require("fs");

var spotify = new Spotify(keys.spotify);

var recordLog = function(data) {
  fs.appendFile("log.txt", JSON.stringify(data) + "\n", function(err) {
    if (err) {
      return console.log(err);
    }

    console.log("Check log.text for the recorded search data!");
  });
};

var artistName = function(artist) {
  return artist.name;
};

var spotify = function(songName) {
  if (songName === undefined) {
    songName = "Bad Liar";
  }

  spotify.search({ type: "track", query: songName }, function(err, data) {
    if (err) {
      console.log("Error occurred: " + err);
      return;
    }

    var songs = data.tracks.items;
    var data = [];

    for (var i = 0; i < songs.length; i++) {
      data.push({
        "artist(s)": songs[i].artists.map(artistName),
        "song name: ": songs[i].name,
        "preview: ": songs[i].preview_url,
        "album: ": songs[i].album.name
      });
    }

    console.log(data);
    recordLog(data);
  });
};

var bandName = function(artist) {
  var queryURL = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp";

  axios.get(queryURL).then(
    function(response) {
      var jsonData = response.data;

      if (!jsonData.length) {
        console.log("Sorry! We can't find any results now for " + artist);
        return;
      }

      var logData = [];

      logData.push("Hooray!! Here's the upcoming concerts information for: " + artist + ":");

      for (var i = 0; i < jsonData.length; i++) {
        var show = jsonData[i];

        logData.push(
          show.venue.city +
            "," +
            (show.venue.region || show.venue.country) +
            " at " +
            show.venue.name +
            " " +
            moment(show.datetime).format("MM/DD/YYYY")
        );
      }

      console.log(logData.join("\n"));
      recordLog(logData.join("\n"));
    }
  );
};

var movieName = function(movie) {
  if (movie === undefined) {
    movie = "Moana";
  }

  var movieURL = "http://www.omdbapi.com/?t=" + movie + "&y=&plot=full&tomatoes=true&apikey=trilogy";

  axios.get(movieURL).then(
    function(response) {
      var jsonData = response.data;

      var data = {
        "Title:": jsonData.Title,
        "Year:": jsonData.Year,
        "Rated:": jsonData.Rated,
        "IMDB Rating:": jsonData.imdbRating,
        "Country:": jsonData.Country,
        "Language:": jsonData.Language,
        "Plot:": jsonData.Plot,
        "Actors:": jsonData.Actors,
        "Rotten Tomatoes Rating:": jsonData.Ratings[1].Value
      };

      console.log(data);
      recordLog(data);
    }
  );
};

var letsProcessIt = function() {
  fs.readFile("random.txt", "utf8", function(error, data) {
    console.log(data);

    var dataArr = data.split(",");

    if (dataArr.length === 2) {
      pick(dataArr[0], dataArr[1]);
    }
    else if (dataArr.length === 1) {
      pick(dataArr[0]);
    }
  });
};

var pick = function(caseData, functionData) {
  switch (caseData) {
  case "concert-this":
    bandName(functionData);
    break;
  case "spotify-this-song":
    spotify(functionData);
    break;
  case "movie-this":
    movieName(functionData);
    break;
  case "do-what-it-says":
    letsProcessIt();
    break;
  default:
    console.log("Help me help you entertain ;D!");
  }
};

var start = function(argumentOne, argumentTwo) {
  pick(argumentOne, argumentTwo);
};

start(process.argv[2], process.argv.slice(3).join(" "));

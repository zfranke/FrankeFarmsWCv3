//Express server to handle requests
const express = require("express");
const app = express();
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const url = require('url');
require('dotenv').config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var PORT = process.env.PORT;

//Import the serverStyles.css stylesheet
app.use(express.static(path.join(__dirname, 'serverStyles.css')));


//Functions
//Get current timestamp function
function getTimeStamp() {
    var date = new Date();
    var timestamp = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    return timestamp;
}

//Get current date function for only day,month,and year
function getDate() {
    var date = new Date();
    var day = date.getDate();
    console.log("Day" + day);
    if(day < 10){
        day = "0" + day;
    }
    var month = date.getMonth() + 1;
    if(month < 10){
        month = "0" + month;
    }
    var year = date.getFullYear();
    var date = year + "-" + month + "-" + day;
    return date;
}

//Function to create soap element and post it to soapList.json
function createSoap(book, chapter, verse, observation, application, prayer, date) {
    //Read the file
    var soapList = JSON.parse(fs.readFileSync('server/soapList.json', 'utf8'));
    //Create the soap object
    var soap = {
        "book": book,
        "chapter": chapter,
        "verse": verse,
        "observation": observation,
        "application": application,
        "prayer": prayer,
        "date": date
    };
    //Stringify the object
    var soapString = JSON.stringify(soap);
    console.log("SOAP: " + soapString);
    //Add the soap object to the json file
    soapList.push(soap);
    //Write the file
    fs.writeFileSync('server/soapList.json', JSON.stringify(soapList));
    return soap;
}

//Search functions for the soapList.json file using only date, book, chapter, and/or verse
function searchSoap(date, book, chapter, verse) {
    //Read the file
    var soapList = JSON.parse(fs.readFileSync('server/soapList.json', 'utf8'));
    //Create an empty array to store the results
    var resultsDate = [];
    var resultsBook = [];
    var resultsChapter = [];
    var resultsVerse = [];
    //Search using the given parameters if given
    if (date != "") {
        for (var i = 0; i < soapList.length; i++) {
            if (soapList[i].date == date) {
                resultsDate.push(soapList[i]);
            }
        }
    }
    if (book != "") {
        for (var i = 0; i < soapList.length; i++) {
            if (soapList[i].book == book) {
                resultsBook.push(soapList[i]);
            }
        }
    }
    if (chapter != "") {
        for (var i = 0; i < soapList.length; i++) {
            if (soapList[i].chapter == chapter) {
                resultsChapter.push(soapList[i]);
            }
        }
    }
    if (verse != "") {
        for (var i = 0; i < soapList.length; i++) {
            if (soapList[i].verse == verse) {
                resultsVerse.push(soapList[i]);
            }
        }
    }
    //Combine the results
    var results = resultsDate.concat(resultsBook, resultsChapter, resultsVerse);
    //Return the results
    return results;
}



//Create a event listener
var myEmitter = new EventEmitter();

//Emitters
//Emitter for when the program starts
//Emitter for when the program Starts, write the results with timestamp to the txt file
myEmitter.on('start', function () {
    var timestamp = getTimeStamp();
    fs.appendFileSync('Logger\log.txt', timestamp + ": Program Started\n");
});

//Emitter for when a GET request for index is called, write the results with timestamp to the txt file
myEmitter.on('get', function () {
    var timestamp = getTimeStamp();
    fs.appendFileSync('Logger\log.txt', timestamp + ": GET request for index\n");
});

//Emitter for when a POST request for soapCreate is called, write the results with timestamp to the txt file
myEmitter.on('post', function () {
    var timestamp = getTimeStamp();
    fs.appendFileSync('Logger\log.txt', timestamp + ": POST request for soapCreate\n");
});


//For a basic / get, return a homepage layout with a table to enter in search values of date, book, chapter: and verse. Also a second table to enter in a soap using  book, chapter, verse, observation, application, and prayer.
app.get("/", (req, res) => {
    myEmitter.emit('get');
    var timestamp = getTimeStamp();
    console.log(timestamp + ":GET request for index");
    res.sendFile(__dirname + "/index.html");
    });

//For a get request of /search, use the given parameters of book, chapter, verse, and/or date to search the json file and return the results.
app.get("/search", (req, res) => {
    myEmitter.emit('get');
    var timestamp = getTimeStamp();
    console.log(timestamp + ":GET request for search");
    var book = req.query.book;
    var chapter = req.query.chapter;
    var verse = req.query.verse;
    var date = req.query.date;

    var results = searchSoap(date, book, chapter, verse);
    //Create a results table for the results
    var table = "<table  border=1><tr><th>Book</th><th>Chapter</th><th>Verse</th><th>Observation</th><th>Application</th><th>Prayer</th><th>Date</th></tr>";
    //Loop through the results and add them to the table
    for (var i = 0; i < results.length; i++) {
        table += "<tr><td>" + results[i].book + "</td><td>" + results[i].chapter + "</td><td>" + results[i].verse + "</td><td>" + results[i].observation + "</td><td>" + results[i].application + "</td><td>" + results[i].prayer + "</td><td>" + results[i].date + "</td></tr>";
    }
    //Close the table
    table += "</table>";
    //Add a link to homepage
    table += "<a href='/'>Home</a>";
    //Send the table to the client
    res.send(table);
    
});

//For a post request of /soapCreate, use the given parameters of book, chapter, verse, observation, application, 
//and prayer to create a soap and post it to the soapList.json file.
app.post("/soapCreate", (req, res) => {
    myEmitter.emit('post');
    var timestamp = getTimeStamp();
    console.log(timestamp + ":POST request for soapCreate");
    var book = req.body.book;
    console.log("Book Read: " + book);
    var chapter = req.body.chapter;
    var verse = req.body.verse;
    var observation = req.body.observation;
    var application = req.body.application;
    var prayer = req.body.prayer;
    var date = getDate();

    //If no parameters are given, return an error message
    if (book == null && chapter == null && verse == null && observation == null && application == null && prayer == null) {
        res.send("Error: No parameters given");
    }
    //If book is missing, return an error message
    else if (book == null) {
        res.send("Error: Book is missing");
    }
    //If chapter is missing, return an error message
    else if (chapter == null) {
        res.send("Error: Chapter is missing");
    }
    //If verse is missing, return an error message
    else if (verse == null) {
        res.send("Error: Verse is missing");
    }
    //If observation is missing, return an error message
    else if (observation == null) {
        res.send("Error: Observation is missing");
    }
    //If application is missing, return an error message
    else if (application == null) {
        res.send("Error: Application is missing");
    }
    //If prayer is missing, return an error message
    else if (prayer == null) {
        res.send("Error: Prayer is missing");
    }
    //If all parameters are given, create a soap and post it to the soapList.json file
    else {
        createSoap(book, chapter, verse, observation, application, prayer, date);
        //Create a results page with the parameters given and a link to the home page
        var results = "<h1>Results</h1>";
        results += "<p>Book: " + book + "</p>";
        results += "<p>Chapter: " + chapter + "</p>";
        results += "<p>Verse: " + verse + "</p>";
        results += "<p>Observation: " + observation + "</p>";
        results += "<p>Application: " + application + "</p>";
        results += "<p>Prayer: " + prayer + "</p>";
        results += "<p>Date: " + date + "</p>";
        results += "<p><a href='/'>Home</a></p>";
        res.send(results);
    }
});

app.listen(PORT, () => {
    myEmitter.emit('start');
    var timestamp = getTimeStamp();
    console.log(timestamp + "SOAP Program Starting");
    console.log(timestamp + `Server listening on ${PORT}`);
});
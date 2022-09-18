/**
 * PromptLogger Utility Tool
 * @module PromptLogger
 * @author Zach Franke
 * @version 1.0.0
 * @requires prompt
 * @requires fs
 * 
 * Used to work with logger style files
 */

//This file is to be used to work with the logger file with two simple functions
var fs = require('fs');
var prompt = require('prompt');

//A function to clear the lab2logger.txt file
function clearLogger() {
    console.log('\n');
    console.log('Clearing the logger...');
    console.log('\n');
    fs.writeFileSync('log.txt', '');
}

//A function to read the lab2logger.txt file to console.log()
function readLogger() {
    console.log('\n');
    console.log('Reading the logger...');
    console.log('\n');
    var data = fs.readFileSync('log.txt', 'utf8');
    console.log(data);
}

//Main menu option to choose which command to run
function mainMenu() {
    console.log('\n');
    console.log('Welcome to the logger utility!');
    console.log('Please choose an option:');
    console.log('1. Clear the logger');
    console.log('2. Read the logger');
    console.log('3. Exit');
    console.log('\n');
    prompt.get(['option'], function (err, result) {
        if (err) {
            return onErr(err);
        }
        switch (result.option) {
            case '1':
                clearLogger();
                mainMenu();
                break;
            case '2':
                readLogger();
                mainMenu();
                break;
            case '3':
                console.log('Thank you for using the logger utility!');
                break;
            default:
                console.log('Invalid option, please try again');
                mainMenu();
        }
    });
}

mainMenu();
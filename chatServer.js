/*
chatServer.js
Author: David Goedicke (da.goedicke@gmail.com)
Closley based on work from Nikolas Martelaro (nmartelaro@gmail.com) as well as Captain Anonymous (https://codepen.io/anon/pen/PEVYXz) who forked of an original work by Ian Tairea (https://codepen.io/mrtairea/pen/yJapwv)
*/

var express = require('express'); // web server application
var app = express(); // webapp
var http = require('http').Server(app); // connects http library to server
var io = require('socket.io')(http); // connect websocket library to server
var serverPort = 8000;
var days = 0;
var tdays = 0;


//---------------------- WEBAPP SERVER SETUP ---------------------------------//
// use express to create the simple webapp
app.use(express.static('public')); // find pages in public directory

// start the server and say what port it is on
http.listen(serverPort, function() {
  console.log('listening on *:%s', serverPort);
});
//----------------------------------------------------------------------------//


//---------------------- WEBSOCKET COMMUNICATION -----------------------------//
// this is the websocket event handler and say if someone connects
// as long as someone is connected, listen for messages
io.on('connect', function(socket) {
  console.log('a new user connected');
  var questionNum = 0; // keep count of question, used for IF condition.
  socket.on('loaded', function() { // we wait until the client has loaded and contacted us that it is ready to go.

    socket.emit('answer', "Hello I am ReallityCheck, I will help you decide if you need to start studying."); //We start with the introduction;
    setTimeout(timedQuestion, 5000, socket, "How many days do you have left before the test?"); // Wait a moment and respond with a question.

  });
  socket.on('message', (data) => { // If we get a new message from the client we process it;
    console.log(data);
    questionNum = bot(data, socket, questionNum); // run the bot function with the new message
  });
  socket.on('disconnect', function() { // This function  gets called when the browser window gets closed
    console.log('user disconnected');
  });
});
//--------------------------CHAT BOT FUNCTION-------------------------------//
function bot(data, socket, questionNum) {
  var input = data;
  var answer;
  var question;
  var waitTime;
  var udays;
  var count;
  var edays;
  var temp;


  if (questionNum == 0) {
    days = Number(input);
    answer = 'Ok so you have ' + days + ' days left to study';
    waitTime = 5000;
    question = 'How long do you usually take to study for a test of this size in days?';
  } else if (questionNum == 1) {
    udays = Number(input);
    tdays = days-udays;
    if (udays <= days){
      answer = 'Ok so atleast you have ' + tdays + ' days more remaining than you usually take to study.';
    }
    if (udays > days){
      answer = 'Ok so you have ' + tdays + ' days less remaining than you usually take to study.';
    }
    waitTime = 5000;
    question = 'Do you have any other work to do between now and the test?'; // load next question
  } else if (questionNum == 2) {
    if (input == 'yes'){
      answer = 'You relly need to finish that other work as soon as possible.';
      waitTime = 5000;
      question = 'How many days will your other work take to complete?';
    }
    if (input == 'no'){
      answer = 'Ok that is good means you only have to focus on the test.';
      questionNum++;
      waitTime = 5000;
      question = 'Do you need to increase your grade in this subject?';
    }
  } else if (questionNum == 3) {
    edays = Number(input);
    tdays = tdays - edays;
    answer = 'Ok so you will need to plan for ' + edays + ' days extra to make time for the other work.';
    waitTime = 5000;
    question = 'Do you need to increase your grade in this subject?'; // load next question
  } else if (questionNum == 4) {
    if (input == 'yes'){
      answer = 'Ok so you will need longer than usual to study.';
    }
    if (input == 'no'){
      answer = 'Ok that is good and means that your normal study time should be sufficient.';
    }
    waitTime = 5000;
    question = 'How many more days than usual will you need to study to get the higher grade?'; // load next question
  } else if (questionNum == 5) {
    edays = Number(input);
    tdays = tdays - edays;
    if (tdays >= 0){
      answer = 'You have ' + tdays + ' more days to study than you need. You can take it easy';
    }
    if (tdays < 0){
      tdays = tdays * -1;
      answer = 'You need ' + tdays + ' more days to study than you have left. You might to pull a few all nighters';
    }
    waitTime = 5000;
  } else {
    answer = 'I have nothing more to say!'; // output response
    waitTime = 5000;
  }


  /// We take the changed data and distribute it across the required objects.
  socket.emit('answer', answer);
  setTimeout(timedQuestion, waitTime, socket, question);
  return (questionNum + 1);
}

function timedQuestion(socket, question) {
  if (question != '') {
    socket.emit('question', question);
  } else {
    //console.log('No Question send!');
  }

}
//----------------------------------------------------------------------------//

const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const bot = require('./bot/bot');
const path = require("path");

const port = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_DB);
mongoose.connection.on('error', console.error);



app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/addQuestion', function(req, res) {
  bot.memory.addQuestion(req.body.question, req.body.answer)
    .then(function(err) {
      res.send("ok");
    });
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
const express = require('express');
const hbs = require( 'express-handlebars' )
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const bot = require('./bot/bot');
const path = require("path");

const port = process.env.PORT || 3000;
const app = express();

app.engine('hbs', hbs({defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


mongoose.connect(process.env.MONGO_DB);
mongoose.connection.on('error', console.error);



app.get('/', function (req, res) {
  res.render('index');
});
app.get('/quizzes', function (req, res) {
  let query = Object.assign({
    isEnded: false
  }, req.query);

  bot.memory.getQuizzes(query).then(quizzes => {
    res.render('quizzes', {quizzes});
  })
});
app.get('/questions', function (req, res) {
    let query = Object.assign({}, req.query);
  bot.memory.getQuestions(req.query).then(questions => {
    res.render('questions', {questions, helpers: {
      dateFormat: input => {
          let date = new Date(input);
          return isNaN(date.getTime()) ? date : date.toISOString().slice(0,10)}}
      }
      );
  })
});

app.post('/addQuestion', function(req, res) {
  let question = req.body.question;
  question.isVerified = false;

  bot.memory.addQuestion(question, req.body.answer)
    .then(function(err) {
      res.send("ok");
    });
})


//* Webhook express *//
app.post(`/bot${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
  console.log('Received webhook');
  bot.instance.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(port, "0.0.0.0", function () {
  console.log(`Example app listening on port ${port}!`);
});
const express = require('express');
const mongoose = require('mongoose');

const port = process.env.PORT || 3000;
const app = express();

mongoose.connect(process.env.MONGO_DB);
mongoose.connection.on('error', console.error);



app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
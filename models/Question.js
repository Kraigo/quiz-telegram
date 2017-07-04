const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    title: String,
    answer: String
});

var Model = mongoose.model('Question', shema);

module.exports = Model;
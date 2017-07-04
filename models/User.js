const mongoose = require('mongoose');


let schema = new mongoose.Schema({
    userId: String,
    firstName: String,
    lastName: String,
    userName: String,
    score: Number

});

var Model = mongoose.model('User', shema);

module.exports = Model;
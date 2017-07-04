const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    chatId: Number,
    question: [{
        type: mongoose.Schema.ObjectId,
        ref: "Question"
    }],
    hint: String,
    hintAvailable: String,
    start: Date,
    isEnded: Boolean,
    winner: [{
        type: mongoose.Schema.ObjectId,
        ref: "User"
    }]
});

var Model = mongoose.model('Team', shema);

module.exports = Model;
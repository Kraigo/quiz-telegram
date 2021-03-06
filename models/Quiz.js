const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    chatId: Number,
    question: {
        type: mongoose.Schema.ObjectId,
        ref: "Question"
    },
    hint: String,
    hintAvailable: Boolean,
    start: Date,
    ended: Date,
    isEnded: Boolean,
    winner: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    }
});


var Model = mongoose.model('Quiz', schema);

module.exports = Model;
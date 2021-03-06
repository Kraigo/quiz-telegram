const mongoose = require('mongoose');

let schema = new mongoose.Schema({
    title: String,
    answer: String,
    created: { type: Date, default: Date.now },
    isVerified: Boolean
});

schema.statics.random = function(callback) {
  this.count(function(err, count) {
    if (err) {
      return callback(err);
    }
    var rand = Math.floor(Math.random() * count);
    this.findOne().skip(rand).exec(callback);
  }.bind(this));
};

var Model = mongoose.model('Question', schema);

module.exports = Model;
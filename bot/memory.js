const appRoot = require('app-root-path');
const Question = require(appRoot + '/models/Question');
const Quiz = require(appRoot + '/models/Quiz');

module.exports = {
    addQuestion(question, answer) {
        var question = new Question({
            title: question,
            answer: answer
        })

        return question.save();
    },
    addQuiz(chatId, question) {
        var quiz = new Quiz({
            start: new Date(),
            chatId: chatId,
            question: question,
            hint: question.answer.split('').map(a => '_').join(''),
            hintAvailable: false,
            isEnded: false
        })
        return quiz.save().then((doc) => 
            Quiz.findOne(doc).populate('question').exec()
        );
    },
    getQuiz(predicate) {
        predicate = Object.assign({
            isEnded: false
        }, predicate)
        return Quiz.findOne(predicate).populate('question').exec();
    },
    updateQuiz(quiz, update) {
        return Quiz.update(quiz, update).exec();
    },
    getRandomQuestion() {
        return new Promise((resolve, reject) => {
            Question.random((err, question) => {
                if (err) reject(err);
                resolve(question);
            })
        })
    },
    getHint() {

    },
}
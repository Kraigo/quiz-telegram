module.exports = {
    quiz(quiz) {
        let question = quiz.question.title;
        let hintFormatted = quiz.hint.split('').join(' ');
        return `Вопрос:\n${question}\nОтвет: *${hintFormatted}*`;
    }
}
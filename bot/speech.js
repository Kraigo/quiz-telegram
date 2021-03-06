module.exports = {
    quiz(quiz) {
        let question = quiz.question.title;
        let hintFormatted = quiz.hint.split('').join(' ');
        return `Вопрос:\n${question}\nОтвет: *${hintFormatted}*`;
    },
    quizEnd(quiz) {
        let answer = quiz.question.answer;
        return `Никто не угадал.\nПравильный ответ: *${answer}*\nНачните новую игру /quiz`
    },
    quizWin() {
        return `Это правильный ответ!\nНачните новую игру /quiz`;
    },
    nohint() {
        return `Нечего подсказывать.\nНачните новую игру /quiz`;
    },
    wanthint() {
        return 'Дать подсказку? /hint';
    }
}
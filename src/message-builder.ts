import { QuizEntity } from "./entities";

export class MessageBuilder {

    constructor(
        private quiz?: QuizEntity
    ) {

    }

    quizText(): string {
        let question = this.quiz.question.title;
        let hintFormatted = this.quiz.hint.split('').join(' ');
        let text = `Вопрос:\n${question}\nОтвет: *${hintFormatted}*`;

        if (this.quiz.hintAvailable) {
            text += `\nДать подсказку? /hint`;
        }
        
        return text;
    }

    quizEnd(): string {
        let answer = this.quiz.question.answer;
        return `Никто не угадал.\nПравильный ответ: *${answer}*\nНачните новую игру /quiz`
    }

    quizWin(): string {
        return `Это правильный ответ!\nНачните новую игру /quiz`;
    }

    nohint(): string {
        return `Нечего подсказывать.\nНачните новую игру /quiz`;
    }

    noQuiz(): string {
        return `Сорри, нету квизов`;
    }

    addQuestionError(): string {
        return 'Напишите ответ на новой строке'
    }

    addQuestionSuccess(): string {
        return 'Вопрос добавлен!'
    }
}
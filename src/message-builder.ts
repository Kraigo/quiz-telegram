import { QuizEntity, UserEntity } from "./entities";

export class MessageBuilder {

    quizText(quiz: QuizEntity): string {
        let question = quiz.question.title;
        let hintFormatted = quiz.hint.split('').join(' ');
        let text = `Вопрос:\n${question}\nОтвет: *${hintFormatted}*`;

        if (quiz.hintAvailable) {
            text += `\nДать подсказку? /hint`;
        }
        
        return text;
    }

    quizEnd(quiz: QuizEntity): string {
        let answer = quiz.question.answer;
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

    addQuestionSuccess(answer: string): string {
        return `Хм, ${answer}?\n Как интересно, я это запомню!`;
    }

    topUsers(users: UserEntity[]): string {
        let text = 'Top 10\n\n';
        text += users.map((u, i) =>
            `${i+1}. ${this.getName(u)} - ${u.score}`)
            .join('\n')
            || 'Top is empty';

        return text;
    }

    private getName(user: UserEntity): string {
        if (user.firstName || user.lastName) {
            return [user.firstName, user.lastName].filter(u => u).join(' ')
        }
        else if (user.username) {
            return user.username;
        }
        else {
            String(user.id)
        }
    }
}
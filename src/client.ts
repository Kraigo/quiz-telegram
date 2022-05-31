import TelegramBot from 'node-telegram-bot-api';
import { isDebug, logger } from './utils';
import { QuizEntity } from './entities';
import { delay, getRandomInt } from './helpers';
import { Memory } from './memory';
import { MessageBuilder } from './message-builder';

export class Client {

    private memory = new Memory();

    constructor(
        private bot: TelegramBot
    ) {
        if (isDebug) {
            this.onMessage = logger(this.onMessage).bind(this);
        }
    }

    init() {
        this.bot.on('message', (message) => this.onMessage(message));
    }

    public async onMessage(message: TelegramBot.Message) {
        const chatId = message.chat.id;
        const text = message.text;

        this.verifyQuiz(message);

        if (text.includes('привет')) {
            this.greating(message);
        }
        else if (text.includes('/quiz')) {
            this.startQuiz(chatId);
        }
        else if (text.includes('/hint')) {
            this.startHint(chatId);
        }
        else if (text.startsWith('/add')) {
            this.addQuestion(message);
        }
        else if (text.startsWith('/top')) {
            this.sendTop(chatId);
        }
    }

    async greating(message: TelegramBot.Message)  {
        const chatId = message.chat.id;

        const res = await this.bot.sendMessage(chatId, 'Привет');
        await this.bot.sendChatAction(chatId, 'typing');
        await delay(5000);

        await this.bot.editMessageText("Лол, кек, чебурек", {chat_id: chatId, message_id: res.message_id});                
        await this.bot.sendChatAction(chatId, null);
    }

    async startQuiz(chatId: number) {
        const quiz = await this.memory.getQuiz({chatId});

        if (quiz) {
            await this.sendQuiz(chatId, quiz);
        } else {
            const question = await this.memory.getRandomQuestion();
            if (question) {
                const quiz = await this.memory.addQuiz(chatId, question);
                await this.sendQuiz(chatId, quiz);
            } else {
                await this.sendEmpty(chatId)
            }
        }
    }

    async sendQuiz(chatId: number, quiz: QuizEntity) {
        const builder = new MessageBuilder();
        const message = builder.quizText(quiz);
        const res = await this.bot.sendMessage(chatId, message, {parse_mode: "Markdown"});

        if (quiz.hintAvailable === false) {

            await delay(5000);
            await this.memory.updateQuiz(quiz.id, {hintAvailable: true});
            quiz = await this.memory.getQuiz({id: quiz.id});
            if (quiz) {
                const message = builder.quizText(quiz);

                this.bot.editMessageText(message, {chat_id: chatId, message_id: res.message_id, parse_mode: "Markdown"});
            }
        }       
    }

    async sendEndQuiz(chatId: number, quiz: QuizEntity) {
        const builder = new MessageBuilder();
        const message = builder.quizEnd(quiz);
        await this.bot.sendMessage(chatId, message, {parse_mode: "Markdown"})
    }

    async sendWinQuiz(chatId: number, msgId) {
        const builder = new MessageBuilder();
        const message = builder.quizWin();
        
        await this.bot.sendMessage(chatId, message,
            {
                parse_mode: "Markdown",
                reply_to_message_id: msgId
            });
    }

    async sendEmpty(chatId: number) {
        const builder = new MessageBuilder();
        const message = builder.noQuiz();
        
        await this.bot.sendMessage(chatId, message,
            {
                parse_mode: "Markdown"
            });
    }


    async startHint(chatId: number) {
        let quiz = await this.memory.getQuiz({chatId})

        if (quiz && quiz.hintAvailable) {
            let nextHint = this.getNextHint(quiz);

            if (nextHint.indexOf('_') >= 0) {
                await this.memory.updateQuiz(quiz.id, {
                    hint: nextHint,
                    hintAvailable: false
                });

                quiz = await this.memory.getQuiz({chatId})
                await this.sendQuiz(chatId, quiz);

            } else {

                await this.memory.updateQuiz(quiz.id, {
                    hintAvailable: false,
                    isEnded: true,
                    ended: new Date()
                });
                quiz = await this.memory.getQuiz({chatId})
                await this.sendEndQuiz(chatId, quiz);
            }

        }
        
        if (!quiz) {
            const builder = new MessageBuilder();
            this.bot.sendMessage(chatId, builder.nohint());
        }
    }
    

    getNextHint(quiz: QuizEntity) {
        let nextHint;
        let notHinted = quiz.question.answer
            .split('')
            .filter((a, i) => quiz.hint[i] === '_');

        if (notHinted.length) {
            nextHint = notHinted[getRandomInt(0, notHinted.length)];
             return quiz.hint
                .split('')
                .map((a, i) => a == '_' && quiz.question.answer[i] === nextHint ? nextHint : a)
                .join('');
        }
        return quiz.hint;
    }
    
    async verifyQuiz(message: TelegramBot.Message) {
        const chatId = message.chat.id;
        const quiz = await this.memory.getQuiz({chatId});
        const userId = message.from.id;

        if (quiz) {
            let quizAnswer = this.fixChars(quiz.question.answer);
            let userAnswer = this.fixChars(message.text);
            if (quizAnswer === userAnswer) {
                let score = quiz.hint.split('').filter(a => a === '_').length;

                if (quiz.question.answer.length === score) {
                    score *= 1.5;
                }
                let user = await this.memory.getUser(userId);
                if (user === null) {
                    user = await this.memory.addUser(userId, {
                        firstName: message.from.first_name,
                        lastName: message.from.last_name,
                        username: message.from.username,
                        languageCode: message.from.language_code
                    })
                }

                await this.memory.updateUserScope(userId, score);
                await this.memory.updateQuiz(quiz.id, {
                    isEnded: true,
                    ended: new Date(),
                    winner: user
                });
                await this.sendWinQuiz(chatId, message.message_id);
            }
        }
    }

    fixChars(val: string) {
        return val
            .trim()
            .toLowerCase()
            .replace(/ë/g, 'e')
            .replace(/ё/g, 'e');
    }

    async addQuestion(message: TelegramBot.Message) {
        const text = message.text.replace(/\/add\s+/, '');
        const data = text.split('\n');
        const chatId = message.chat.id;
        const builder = new MessageBuilder();

        if (data.length < 2) {
            const text = builder.addQuestionError();
            await this.bot.sendMessage(chatId, text);
            return;
        }

        const lastIndex = data.length - 1;
        const question = data.slice(0, lastIndex).join('\n');
        const answer = data[lastIndex].trim();

        // TODO: Validate existing questions;

        if (question && answer) {
            await this.memory.addQuestion(question, answer);
            const text = builder.addQuestionSuccess(answer);
            await this.bot.sendMessage(chatId, text, {reply_to_message_id: message.message_id});
        }
    }

    async sendTop(chatId: number) {
        const users = await this.memory.getTopUser(chatId);
        const builder = new MessageBuilder();
        const text = builder.topUsers(users);
        await this.bot.sendMessage(chatId, text, {parse_mode: 'Markdown'});
    }
}

import TelegramBot from "node-telegram-bot-api";
import { QuestionEntity } from "./entities";
import { Memory } from "./memory";
import { MessageBuilder } from "./message-builder";

export class Management {
    private memory = new Memory();
    private builder = new MessageBuilder();
    private managerChatId = Number(process.env.MANAGER_CHAT_ID);


    constructor(
        private bot: TelegramBot
    ) {

    }

    public async onMessage(message: TelegramBot.Message) {
        if (message.chat.id !== this.managerChatId) {
            return;
        }
        const chatId = message.chat.id;
        const text = message.text || '';

        if (text.startsWith('/verify')) {
            this.sendRandomQuestion();
        }
        else if (text.startsWith('/stats')) {
            this.sendStats();
        }
    }

    async onQuery(query: TelegramBot.CallbackQuery) {
        const params = new URLSearchParams(query.data);
        const action = params.get('action');

        switch (action) {
            case 'accept': {
                const questionId = Number(params.get('questionId'));
                await this.acceptQuestion(questionId, query);
                break;
            }
            case 'decline': {
                const questionId = Number(params.get('questionId'));
                await this.declineQuestion(questionId, query);
                break;
            }
        }
    }


    async sendQuestionForValidation(question: QuestionEntity) {
        const builder = new MessageBuilder();
        const text = builder.questionText(question);

        await this.bot.sendMessage(this.managerChatId, text, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: "✅ Принять",
                        callback_data: new URLSearchParams({
                            questionId: String(question.id),
                            action: 'accept'
                        }).toString()
                    },

                    {
                        text: "❌ Отменить",
                        callback_data: new URLSearchParams({
                            questionId: String(question.id),
                            action: 'decline'
                        }).toString()
                    }
                ]]
            }
        });
    }

    async sendRandomQuestion() {
        const question = await this.memory.getRandomQuestion({isVerified: null});
        if (question) {
            this.sendQuestionForValidation(question);
        } else {
            const text = this.builder.noRandomQuestion()
            this.bot.sendMessage(this.managerChatId, text);
        }
    }

    async acceptQuestion(questionId: number, query: TelegramBot.CallbackQuery) {
        try {
            await this.memory.updateQuestion(questionId, { isVerified: true });
            const question = await this.memory.getQuestion(questionId);
            const chatId = query.message.chat.id;
            const messageId = query.message.message_id;
            const actionText = '✅ Принято'

            await this.bot.answerCallbackQuery(query.id, { text: actionText });

            let text = this.builder.questionText(question);
            text += `\n\n ${actionText}`;

            await this.bot.editMessageText(text, {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: { inline_keyboard: [[]] }
            });
        }
        catch (e) {
            console.error(e);
        }
    }

    async declineQuestion(questionId: number, query: TelegramBot.CallbackQuery) {
        try {
            await this.memory.updateQuestion(questionId, { isVerified: false });
            const question = await this.memory.getQuestion(questionId);
            const chatId = query.message.chat.id;
            const messageId = query.message.message_id;
            const actionText = '❌ Отменено'

            await this.bot.answerCallbackQuery(query.id, { text: actionText });

            let text = this.builder.questionText(question);
            text += `\n\n ${actionText}`;

            await this.bot.editMessageText(text, {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: { inline_keyboard: [[]] }
            });
        }
        catch (e) {
            console.error(e);
        }
    }

    async sendStats() {
        let text = 'Статус:';
        text += `\nВопросов: *${await this.memory.questionsRepository.count()}*`;
        text += ` (+${await this.memory.questionsRepository.countBy({isVerified: true})}`;
        text += ` | -${await this.memory.questionsRepository.countBy({isVerified: false})})`;
        text += `\nВикторин сыграно: *${await this.memory.quizesRepository.count()}*`;

        text += `\nПользователей:  *${await this.memory.usersRepository.count()}*`

        let {sum: score} = await this.memory.usersRepository
            .createQueryBuilder("user")
            .select("SUM(user.score)", "sum")
            .getRawOne();

        text += `\nВсего очков:  *${score}*`

        await this.bot.sendMessage(this.managerChatId, text, {parse_mode: "Markdown"});
    }
}
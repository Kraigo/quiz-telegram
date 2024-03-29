import TelegramBot from "node-telegram-bot-api";
import { dataSourceFile } from "./data-source";
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
        else if (text.startsWith('/backup')) {
            this.sendBackup();
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
        let {sum: score} = await this.memory.usersRepository
            .createQueryBuilder("user")
            .select("SUM(user.score)", "sum")
            .getRawOne();

        const text = this.builder.stats({
            questionsTotalCount: await this.memory.questionsRepository.count(),
            verifiedQuestionsCount: await this.memory.questionsRepository.countBy({isVerified: true}),
            unverifiedQuestionsCount: await this.memory.questionsRepository.countBy({isVerified: false}),
            quizesTotalCount: await this.memory.quizesRepository.count(),
            usersTotalCount: await this.memory.usersRepository.count(),
            chatsTotalCount: await this.memory.chatsRepository.count(),
            score
        });

        await this.bot.sendMessage(this.managerChatId, text, {parse_mode: "Markdown"});
    }

    async sendBackup() {
        const now = new Date();
        const date = [
            now.getFullYear(),
            now.getMonth() + 1,
            now.getDate()
        ].join('-');
        await this.bot.sendMessage(this.managerChatId, `#Backup for ${date}`)
        await this.bot.sendDocument(this.managerChatId, dataSourceFile);
    }
}
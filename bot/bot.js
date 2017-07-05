const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});

const smart = require('./smart')(bot);
const memory = require('./memory');

bot.on("message", msg => {
    let chatId = msg.chat.id;

    if (msg.text.includes('привет')) {
        smart.greating(msg);
    } else if (msg.text.includes('/quiz')) {
        smart.startQuiz(chatId);
    } else if (msg.text.includes('/hint')) {
        smart.startHint(chatId);
    }
})


module.exports = {
    bot,
    memory
};
const TelegramBot = require('node-telegram-bot-api');
var bot;

if (process.env.NODE_ENV === 'production') {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
    bot.setWebHook(`${process.env.SITE_URL}/bot${process.env.TELEGRAM_BOT_TOKEN}`);
} else {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});
}

const smart = require('./smart')(bot);
const memory = require('./memory');

bot.on("message", msg => {
    let chatId = msg.chat.id;

    smart.checkQuiz(msg);

    if (msg.text.includes('привет')) {
        smart.greating(msg);
    } else if (msg.text.includes('/quiz')) {
        smart.startQuiz(chatId);
    } else if (msg.text.includes('/hint')) {
        smart.startHint(chatId);
    }
})


module.exports = {
    instance,
    memory
};
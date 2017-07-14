const TelegramBot = require('node-telegram-bot-api');
const options = {
  webHook: {
    port: process.env.PORT
  }
};
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, options);

const smart = require('./smart')(bot);
const memory = require('./memory');

bot.setWebHook(`${process.env.SITE_URL}:443/bot${process.env.TELEGRAM_BOT_TOKEN}`);

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
    bot,
    memory
};
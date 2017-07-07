const TelegramBot = require('node-telegram-bot-api');

const options = {
  webHook: {
    // Port to which you should bind is assigned to $PORT variable
    // See: https://devcenter.heroku.com/articles/dynos#local-environment-variables
    port: process.env.PORT
    // you do NOT need to set up certificates since Heroku provides
    // the SSL certs already (https://<app-name>.herokuapp.com)
    // Also no need to pass IP because on Heroku you need to bind to 0.0.0.0
  }
};

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, options);

const smart = require('./smart')(bot);
const memory = require('./memory');

bot.setWebHook(`${process.env.SITE_URL}/bot${process.env.TELEGRAM_BOT_TOKEN}`);

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
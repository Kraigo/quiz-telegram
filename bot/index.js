const TelegramBot = require('node-telegram-bot-api');
const token = "token"

const bot = new TelegramBot(token, {polling: true});
module.exports = bot;
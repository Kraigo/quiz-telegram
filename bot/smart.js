const memory = require('./memory');
const speech = require('./speech');

module.exports = function(bot) {
    return {
        greating(msg) {
            const chatId = msg.chat.id;
            bot.sendMessage(chatId, 'Привет').then( res => {
                bot.sendChatAction(chatId, 'typing');
                setTimeout(() => {
                    bot.editMessageText("Лол, кек, чебурек", {chat_id: chatId, message_id: res.message_id});                
                    bot.sendChatAction(chatId, null);
                }, 5000)
            });
        },

        startQuiz(chatId) {
            memory.getQuiz({chatId}).then(quiz => {
               if (quiz) {
                   this.sendQuiz(chatId, quiz);
               } else {
                    memory.getRandomQuestion().then(question => {
                        memory.addQuiz(chatId, question).then(quiz => {
                            this.sendQuiz(chatId, quiz);
                        })                
                    })
                }
            });
        },

        sendQuiz(chatId, quiz) {
            bot.sendMessage(chatId, speech.quiz(quiz), {parse_mode: "Markdown"});
        }

    }
}
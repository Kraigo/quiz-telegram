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
            var message = speech.quiz(quiz);
            bot.sendMessage(chatId, message, {parse_mode: "Markdown"}).then(res => {

                setTimeout(() => {
                    quiz.hintAvailable = true;
                    quiz.save().then(() => {
                        message += `\nДать подсказку /hint ?`;
                        bot.editMessageText(message, {chat_id: chatId, message_id: res.message_id});
                    });
                }, 5000);
                
            });

            
        },


        startHint(chatId) {
            memory.getQuiz({chatId}).then(quiz => {
                if (quiz && quiz.hintAvailable) {
                    quiz.hint = this.getNextHint(quiz);
                    quiz.hintAvailable = false;

                    quiz.save().then(() => {
                        if (quiz.hint.split('').filter(a => a === '_').length > 0) {
                            this.sentQuiz(chatId, quiz);
                        }
                    })

                } else {
                    bot.sendMessage(chatId, speech.nohint());
                }
            });
        },
        sendHint(chatId, quiz) {

        },
        getNextHint(quiz) {
            let notHinted = quiz.question.answer.split('').filter((a, i) => quiz.hint[i] === '_');
            let nextHint;
            if (notHinted.length) {
                nextHint = notHinted[getRandomInt(0, notHinted.length)];
                 return quiz.hint
                    .split('')
                    .map((a, i) => a == '_' && quiz.question.answer[i] === nextHint ? nextHint : a)
                    .join('');
            }
            return quiz.hint;
        }

    }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
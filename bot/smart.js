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
            let message = speech.quiz(quiz);
            if (quiz.hintAvailable) {
                message += '\n'+speech.wanthint();
            }
            return bot.sendMessage(chatId, message, {parse_mode: "Markdown"})
                .then(res => {

                    if (quiz.hintAvailable === false) {
                        setTimeout(() => {
                            quiz.hintAvailable = true;
                            quiz.save().then(() => {
                                message += '\n'+speech.wanthint();
                                bot.editMessageText(message, {chat_id: chatId, message_id: res.message_id, parse_mode: "Markdown"});
                            });
                        }, 5000);
                    }
                    
                });            
        },
        sendEndQuiz(chatId, quiz) {
            let message = speech.quizEnd(quiz);
            return bot.sendMessage(chatId, message, {parse_mode: "Markdown"})
        },

        sendWinQuiz(chatId, msgId) {
            let message = speech.quizWin();
            return bot.sendMessage(chatId, message,
                {
                    parse_mode: "Markdown",
                    reply_to_message_id: msgId
                });
        },


        startHint(chatId) {
            memory.getQuiz({chatId}).then(quiz => {

                if (quiz && quiz.hintAvailable) {
                    let nextHint = this.getNextHint(quiz);

                    if (nextHint.indexOf('_') >= 0) {
                        quiz.update({
                            hint: nextHint,
                            hintAvailable: false
                        }, (err) => {
                            memory.getQuiz({chatId}).then(quiz => {
                                this.sendQuiz(chatId, quiz);
                            })

                        });
                    } else {
                        quiz.update({
                            hintAvailable: false,
                            isEnded: true,
                            ended: new Date()
                        }, (err) => {

                            this.sendEndQuiz(chatId, quiz);

                        });
                    }

                }
                
                if (!quiz) {
                    bot.sendMessage(chatId, speech.nohint());
                }
            });
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
        },

        checkQuiz(message) {
            let chatId = message.chat.id;

            memory.getQuiz({chatId}).then(quiz => {
                if (quiz) {
                    let quizAnswer = quiz.question.answer.trim().toLowerCase();
                    let userAnswer = message.text.trim().toLowerCase();
                    if (quizAnswer === userAnswer) {
                        let score = quiz.hint.split('').filter(a => a === '_').length;

                        if (quiz.question.answer.length === score) {
                            score *= 1.5;
                        }

                        quiz.update({
                            isEnded: true,
                            ended: new Date()
                        }, (err) => {

                            this.sendWinQuiz(chatId, message.message_id);

                        });                       

                    }
                }
            })
        }

    }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
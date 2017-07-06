const mongoose = require('mongoose');
const cheerio = require('cheerio');
const request = require('request');
const iconv = require('iconv-lite');
const appRoot = require('app-root-path');
const Question = require(appRoot + '/models/Question');

mongoose.connect(process.env.MONGO_DB);
mongoose.connection.on('error', console.error);

const siteAddress = "http://vochat.kz/_victorina_base**.php";
const pageSize = 133; //133;

var chain = Promise.resolve();

for ( let i = 0; i <= pageSize; i++) {
    chain = chain.then(function() {
        return new Promise((resolve, reject) => {
            request.get({
                    uri: siteAddress.replace('**', ('00' + i).slice(-2)),
                    encoding: 'binary'
                },
                function(error, response, body) {
                let $ = cheerio.load(body)
                let $content = $('.postContent p b');
                let questions = [];

                for(let c = 0; c < $content.length; c+=2) {
                    let question = $content.eq(c).text();
                    let answer = $content.eq(c+1).text();
                    questions.push({
                        title: iconv.decode(question, 'win1251'),
                        answer: iconv.decode(answer, 'win1251'),
                        isVerified: true
                    })
                }

                Question.create(questions, function(err) {
                    console.log(`Saved ${i}/${pageSize}`)
                    resolve();
                });

            });
        });
    });
}

chain.then(function() {
    console.log('Complete');
})
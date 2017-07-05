const cheerio = require('cheerio');
const request = require('request');
const iconv = require('iconv-lite');

const siteAddress = "http://vochat.kz/_victorina_base**.php";
const pageSize = 0; //133;

var list = [];

for ( let i = 0; i <= pageSize; i++) {
    request.get({
            uri: siteAddress.replace('**', ('00' + i).slice(-2)),
            encoding: 'binary'
        },
        function(error, response, body) {
        let $ = cheerio.load(body)
        let $content = $('.postContent p b');

        for(let c = 0; c < $content.length; c++) {
            let question = $content.eq(c).text();
            let answer = $content.eq(c+1).text();
            list.push({
                question: iconv.decode(question, 'win1251'),
                answer: iconv.decode(answer, 'win1251')
            })
        }
    });
}
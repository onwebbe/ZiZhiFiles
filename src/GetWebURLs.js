'use strict';
const MySQLCompanyZiZhi = require('./mysql/MySQLCompanyZiZhi');
const zizhiDB = new MySQLCompanyZiZhi();
const cheerio = require('cheerio');
const superagent = require('superagent');
require('superagent-proxy')(superagent);
const async = require('async');

class GetWebURLS {
    async getCompanyURL () {
        var self = this;
        let companyList = await zizhiDB.queryDB('companyinfo', {
            processed: '0'
        });
        let companyNameList = [];
        for (let i = 0; i < companyList.length; i++) {
            let companyInfo = companyList[i];
            let companyName = companyInfo.companyname;
            companyNameList.push(companyName);
        }
        console.log('Start process:' + companyNameList.length);
        async.eachLimit(companyNameList, 1, function(companyName, callback) {
            var url = 'https://www.tianyancha.com/search?key=' + encodeURI(companyName);
            console.log('Get URL from:' + url);
            var ServerCookie = 'aliyungf_tc=AQAAAC/2s2f2Uw0AYgdXZV1TCFTziHFL; csrfToken=gipQEihLXGfa8FObBnggl99D; TYCID=d6635c80067f11e985d701268d6c09e9; undefined=d6635c80067f11e985d701268d6c09e9; ssuid=5771754858; Hm_lvt_e92c8d65d92d534b0fc290df538b4758=1545548175; _ga=GA1.2.465364743.1545548176; RTYCID=e9d8db2668e547c996193da004acbcf4; CT_TYCID=4f2a1d091f56449ca56dfc579047b366; cloud_token=1b8aef02e7e646658471a47a5621383b; __insp_wid=677961980; __insp_nv=true; __insp_targlpu=aHR0cHM6Ly93d3cudGlhbnlhbmNoYS5jb20vbG9naW4%2FZnJvbT1odHRwcyUzQSUyRiUyRnd3dy50aWFueWFuY2hhLmNvbSUyRnNlYXJjaCUzRmtleSUzRCUyNUU3JTI1OTklMjVCRSUyNUU2JTI1OTYlMjVBRiUyNUU3JTI1ODklMjVCOSUyNUU1JTI1QUUlMjU5RSUyNUU0JTI1QjglMjU5QSUyNUVGJTI1QkMlMjU4OCUyNUU0JTI1QjglMjU4QSUyNUU2JTI1QjUlMjVCNyUyNUVGJTI1QkMlMjU4OSUyNUU2JTI1OUMlMjU4OSUyNUU5JTI1OTklMjU5MCUyNUU1JTI1ODUlMjVBQyUyNUU1JTI1OEYlMjVCOA%3D%3D; __insp_targlpt=5aSp55y85p_lLeS6uuS6uumDveWcqOeUqOWVhuS4muWuieWFqOW3peWFt1%2FkvIHkuJrkv6Hmga%2Fmn6Xor6Jf5YWs5Y_45p_l6K_iX_W3peWVhuafpeivol%2FkvIHkuJrkv6HnlKjkv6Hmga%2Fmn6Xor6Lns7vnu58%3D; _gid=GA1.2.1932705484.1545652378; __insp_norec_sess=true; bannerFlag=true; tyc-user-info=%257B%2522claimEditPoint%2522%253A%25220%2522%252C%2522myQuestionCount%2522%253A%25220%2522%252C%2522explainPoint%2522%253A%25220%2522%252C%2522nickname%2522%253A%2522%25E5%25A7%259A%25E5%25BF%2585%25E8%25BE%25BE-mst%2522%252C%2522integrity%2522%253A%25220%2525%2522%252C%2522nicknameSup%2522%253A%2522mst%2522%252C%2522state%2522%253A%25220%2522%252C%2522announcementPoint%2522%253A%25220%2522%252C%2522nicknameOriginal%2522%253A%2522%25E5%25A7%259A%25E5%25BF%2585%25E8%25BE%25BE%2522%252C%2522vipManager%2522%253A%25220%2522%252C%2522discussCommendCount%2522%253A%25220%2522%252C%2522monitorUnreadCount%2522%253A%25224%2522%252C%2522onum%2522%253A%25220%2522%252C%2522claimPoint%2522%253A%25220%2522%252C%2522token%2522%253A%2522eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMzkwMTk1ODkzNyIsImlhdCI6MTU0NTY1MjU2NSwiZXhwIjoxNTYxMjA0NTY1fQ.7IsexniXOWY8PFueyFKliGT55uWOKCTJ7-MLxJyQXjyDRnOfWHtM6KBE8OVQDbFAGNNXZcIRyyX46bgJykSpTA%2522%252C%2522pleaseAnswerCount%2522%253A%25220%2522%252C%2522redPoint%2522%253A%25220%2522%252C%2522bizCardUnread%2522%253A%25220%2522%252C%2522vnum%2522%253A%25220%2522%252C%2522mobile%2522%253A%252213901958937%2522%257D; auth_token=eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMzkwMTk1ODkzNyIsImlhdCI6MTU0NTY1MjU2NSwiZXhwIjoxNTYxMjA0NTY1fQ.7IsexniXOWY8PFueyFKliGT55uWOKCTJ7-MLxJyQXjyDRnOfWHtM6KBE8OVQDbFAGNNXZcIRyyX46bgJykSpTA; __insp_slim=1545652568898; Hm_lpvt_e92c8d65d92d534b0fc290df538b4758=1545652569; _gat_gtag_UA_123487620_1=1';

            superagent.get(url)
                // .proxy('http://119.101.113.134:9999')
                .set('Cookie', ServerCookie)          //随便论坛里的一个地址
                .end(async function(err, res){
                if (err) {
                    console.log(err);
                    return;
                };
                let $ = cheerio.load(res.text);
                let searchItem = $('.result-list>.search-item');
                console.log('Got data:' + searchItem.length);
                if (searchItem.length > 0) {
                    let $ = cheerio.load(searchItem[0]);
                    let nameEle = $('.content a.name');
                    let tel = $('.content .contact > .col > span').text();
                    let rawData = $('.tt.hidden').text();
                    let companyURL = nameEle.attr('href');
                    console.log('Update: ' + companyName + ' URL: ' + companyURL);
                    await self.updateCompanyURL(companyName, companyURL);
                    await self.updateCompanyContact(companyName, tel);
                    await self.updateCompanyRaw(companyName, rawData);
                    setTimeout(function () {
                        callback();
                    }, 2000);
                } else {
                    setTimeout(function () {
                        callback();
                    }, 2000);
                }
            });
        }, function(err) {
            // if any of the file processing produced an error, err would equal that error
            if( err ) {
              // One of the iterations produced an error.
              // All processing will now stop.
              console.log('A file failed to process');
            } else {
              console.log('All files have been processed successfully');
            }
        });
    }

    updateCompanyURL(companyname, companyurl) {
        return zizhiDB.updateDB('companyinfo', {'companyname': companyname}, {'tianyanchaurl': companyurl, processed: '1'});
    }
    updateCompanyRaw(companyname, companyurl) {
        return zizhiDB.updateDB('companyinfo', {'companyname': companyname}, {'tianyancharawdata': companyurl, processed: '1'});
    }
    updateCompanyContact(companyname, companyurl) {
        return zizhiDB.updateDB('companyinfo', {'companyname': companyname}, {'tianyanchacontactdata': companyurl, processed: '1'});
    }
}

let t = new GetWebURLS();
t.getCompanyURL();
// var ServerCookie = 'aliyungf_tc=AQAAAC/2s2f2Uw0AYgdXZV1TCFTziHFL; csrfToken=gipQEihLXGfa8FObBnggl99D; TYCID=d6635c80067f11e985d701268d6c09e9; undefined=d6635c80067f11e985d701268d6c09e9; ssuid=5771754858; Hm_lvt_e92c8d65d92d534b0fc290df538b4758=1545548175; _ga=GA1.2.465364743.1545548176; RTYCID=e9d8db2668e547c996193da004acbcf4; CT_TYCID=4f2a1d091f56449ca56dfc579047b366; cloud_token=1b8aef02e7e646658471a47a5621383b; __insp_wid=677961980; __insp_nv=true; __insp_targlpu=aHR0cHM6Ly93d3cudGlhbnlhbmNoYS5jb20vbG9naW4%2FZnJvbT1odHRwcyUzQSUyRiUyRnd3dy50aWFueWFuY2hhLmNvbSUyRnNlYXJjaCUzRmtleSUzRCUyNUU3JTI1OTklMjVCRSUyNUU2JTI1OTYlMjVBRiUyNUU3JTI1ODklMjVCOSUyNUU1JTI1QUUlMjU5RSUyNUU0JTI1QjglMjU5QSUyNUVGJTI1QkMlMjU4OCUyNUU0JTI1QjglMjU4QSUyNUU2JTI1QjUlMjVCNyUyNUVGJTI1QkMlMjU4OSUyNUU2JTI1OUMlMjU4OSUyNUU5JTI1OTklMjU5MCUyNUU1JTI1ODUlMjVBQyUyNUU1JTI1OEYlMjVCOA%3D%3D; __insp_targlpt=5aSp55y85p_lLeS6uuS6uumDveWcqOeUqOWVhuS4muWuieWFqOW3peWFt1%2FkvIHkuJrkv6Hmga%2Fmn6Xor6Jf5YWs5Y_45p_l6K_iX_W3peWVhuafpeivol%2FkvIHkuJrkv6HnlKjkv6Hmga%2Fmn6Xor6Lns7vnu58%3D; _gid=GA1.2.1932705484.1545652378; __insp_norec_sess=true; bannerFlag=true; tyc-user-info=%257B%2522claimEditPoint%2522%253A%25220%2522%252C%2522myQuestionCount%2522%253A%25220%2522%252C%2522explainPoint%2522%253A%25220%2522%252C%2522nickname%2522%253A%2522%25E5%25A7%259A%25E5%25BF%2585%25E8%25BE%25BE-mst%2522%252C%2522integrity%2522%253A%25220%2525%2522%252C%2522nicknameSup%2522%253A%2522mst%2522%252C%2522state%2522%253A%25220%2522%252C%2522announcementPoint%2522%253A%25220%2522%252C%2522nicknameOriginal%2522%253A%2522%25E5%25A7%259A%25E5%25BF%2585%25E8%25BE%25BE%2522%252C%2522vipManager%2522%253A%25220%2522%252C%2522discussCommendCount%2522%253A%25220%2522%252C%2522monitorUnreadCount%2522%253A%25224%2522%252C%2522onum%2522%253A%25220%2522%252C%2522claimPoint%2522%253A%25220%2522%252C%2522token%2522%253A%2522eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMzkwMTk1ODkzNyIsImlhdCI6MTU0NTY1MjU2NSwiZXhwIjoxNTYxMjA0NTY1fQ.7IsexniXOWY8PFueyFKliGT55uWOKCTJ7-MLxJyQXjyDRnOfWHtM6KBE8OVQDbFAGNNXZcIRyyX46bgJykSpTA%2522%252C%2522pleaseAnswerCount%2522%253A%25220%2522%252C%2522redPoint%2522%253A%25220%2522%252C%2522bizCardUnread%2522%253A%25220%2522%252C%2522vnum%2522%253A%25220%2522%252C%2522mobile%2522%253A%252213901958937%2522%257D; auth_token=eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMzkwMTk1ODkzNyIsImlhdCI6MTU0NTY1MjU2NSwiZXhwIjoxNTYxMjA0NTY1fQ.7IsexniXOWY8PFueyFKliGT55uWOKCTJ7-MLxJyQXjyDRnOfWHtM6KBE8OVQDbFAGNNXZcIRyyX46bgJykSpTA; __insp_slim=1545652568898; Hm_lpvt_e92c8d65d92d534b0fc290df538b4758=1545652569; _gat_gtag_UA_123487620_1=1';
// superagent.get('https://www.tianyancha.com/search?key=%E5%B9%BF%E4%B8%9C%E7%9C%81%E6%B2%99%E8%A7%92%EF%BC%88C%E5%8E%82%EF%BC%89%E5%8F%91%E7%94%B5%E6%9C%89%E9%99%90%E5%85%AC%E5%8F%B8')
// .set('Cookie', ServerCookie)
// .then(function (err, res) {
//     console.log(res);
// })
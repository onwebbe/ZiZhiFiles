'use strict';
const MySQLCompanyZiZhi = require('./mysql/MySQLCompanyZiZhi');
const zizhiDB = new MySQLCompanyZiZhi();
const cheerio = require('cheerio');
const superagent = require('superagent');

class GetWebURLS {
    async getCompanyURL () {
        let companyList = await zizhiDB.queryDB('companyinfo');
        for (let i = 0; i < companyList.length; i++) {
            let companyInfo = companyList[i];
            let companyName = companyInfo.companyname;
            superagent.get("https://www.tianyancha.com/search?key=" + encodeURI(companyName))             //随便论坛里的一个地址
            .end(async function(err, res){
                if (err) {
                    console.log(err);
                    return;
                };
                let $ = cheerio.load(res.text);
                let theData = $('.content > .header > a.name.select-none');
                if (theData.length > 0) {
                    let companyURL = theData.attr('href');
                    console.log('Update: ' + companyName + ' URL: ' + companyURL);
                    await self.updateCompanyURL(companyName, companyURL);
                } else {
                    console.log('No Data');
                }
            })    
        }
    }

    updateCompanyURL(companyname, companyurl) {
        return zizhiDB.updateDB('companyinfo', {'companycode': companyname}, {'tianyanchaurl': companyurl});
    }
}

let t = new GetWebURLS();
t.getCompanyURL();
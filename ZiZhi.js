'use strict';
const fs = require('fs');
const csv = require('fast-csv');
const async = require('async');
const MySQLCompanyZiZhi = require('./mysql/MySQLCompanyZiZhi');

class ZiZhiUtils {
    constructor () {
        this.zizhiDB = new MySQLCompanyZiZhi();
    }
    importCSVFile(filename, csvCompanyType, csvCompanyLocation, headers) {
        var self = this;
        var dataList = [];
        csv
            //.fromPath("/Users/i326432/Documents/上海施工企业资质企业名录.csv", {headers : ['companycode', 'companyname', 'zizhiname', 'zizhilevel', 'zizhiscope', 'zizhiapprovedate', 'zizhivaliduntildate']})
            .fromPath(filename, {headers : headers})
            .on("data", function(data){
                dataList.push(data);
            })
            .on("end", async () => {
                await self.processCompany(dataList, csvCompanyType, csvCompanyLocation);
                await self.processZizhi(dataList);
                await self.processCompanyZiZhi(dataList);
                console.log('All processed, close the connection');
                self.zizhiDB.closeConnection();
                // await self.processContact(dataList);
            console.log("done");
            });
    }
    async processContact(dataList) {
        var self = this;
        return new Promise(async function(resolve, reject) {
            getCompanyAndZiZhi().then(async (infoObj) => {
                let companylist = infoObj.companyList;
                for (let i = 0; i < companylist.length; i++) {
                    let companyInfo = companylist[i];
                    let companyid = companyInfo.companyid;
                    let companyname = companyInfo.companyname;
                    console.log('----------------------Start Process: ' + companyid + ':' + companyname);
                    let companyRawData = companyInfo['tianyancharawdata'];
                    if (companyRawData === null || companyRawData === '') {
                        continue;
                    }
                    try {
                        let rawData = JSON.parse(companyRawData);
                        let telList = rawData.phoneList;
                        let emailList = rawData.emailList;
                        let addressCity = rawData.city;
                        let addressDisrict = rawData.district;
                        if (telList != null && telList.length > 0) {
                            for (let j = 0; j < telList.length; j++) {
                                let contactInfo = {
                                    'contacttype': '电话',
                                    'contactinfo': telList[j]
                                };
                                let returnObj = await self.zizhiDB.insertDB('contactinfo', contactInfo, ['contactid'], ['contactid']);
                                let primaryKey = returnObj['primarykey'];
                                let contactcompany = {
                                    'companyid': companyid,
                                    'contactid': primaryKey
                                }
                                await self.zizhiDB.insertDB('companycontact', contactcompany, [], ['companyid', 'contactid']);
                            }
                        }
                        if (emailList != null && emailList.length > 0) {
                            for (let j = 0; j < emailList.length; j++) {
                                let contactInfo = {
                                    'contacttype': '电子邮箱',
                                    'contactinfo': emailList[j]
                                };
                                let returnObj = await self.zizhiDB.insertDB('contactinfo', contactInfo, ['contactid'], ['contactid']);
                                let primaryKey = returnObj['primarykey'];
                                let contactcompany = {
                                    'companyid': companyid,
                                    'contactid': primaryKey
                                }
                                await self.zizhiDB.insertDB('companycontact', contactcompany, [], ['companyid', 'contactid']);
                            }
                        }
                        let contactInfo = {
                            'contacttype': '注册城市',
                            'contactinfo': addressCity
                        };
                        let returnObj = await self.zizhiDB.insertDB('contactinfo', contactInfo, ['contactid'], ['contactid']);
                        let primaryKey = returnObj['primarykey'];
                        let contactcompany = {
                            'companyid': companyid,
                            'contactid': primaryKey
                        }
                        await self.zizhiDB.insertDB('companycontact', contactcompany, [], ['companyid', 'contactid']);
    
                        contactInfo = {
                            'contacttype': '注册区域',
                            'contactinfo': addressDisrict
                        };
                        returnObj = await self.zizhiDB.insertDB('contactinfo', contactInfo, ['contactid'], ['contactid']);
                        primaryKey = returnObj['primarykey'];
                        contactcompany = {
                            'companyid': companyid,
                            'contactid': primaryKey
                        }
                    } catch (e) {
    
                    }
                }
            });
        });
    }
    async processCompany(dataList, processCompany, csvCompanyLocation) {
        var self = this;
        return new Promise(async function(resolve, reject) {
            async.eachLimit(dataList, 1, function(data, callback) {
                let companykey = data.companycode + '::' + data.companyname;
                var companyInfo = {
                    'companycode': data.companycode,
                    'companyname': data.companyname,
                    'companycategory': processCompany,
                    'companylocation': csvCompanyLocation
                }
                let companylist = {};
                try {
                    self.zizhiDB.insertDB('companyinfo', companyInfo, ['companyid'], ['companycode', 'companyname']).then((res)=>{
                        console.log(res);
                        let companyid = res.primarykey;
                        delete res.primarykey;
                        let companykey = res.companycode + '::' + res.companyname;
                        res.companyid = companyid;
                        companylist[companykey] = res;
                        console.log('End Add Company');
                        // self.zizhiDB.closeConnection();
                        callback();
                    }).catch((error) => {
                        // self.zizhiDB.closeConnection();
                        console.log('Error:' + error);
                        callback();
                    });
                } catch(e) {
                    // self.zizhiDB.closeConnection();
                    console.log('Error:' + e);
                    callback();
                }
            }, function (err) {
                resolve();
            });
        });
    }
    async processZizhi(dataList) {
        var self = this;
        return new Promise(async function(resolve, reject) {
            async.eachLimit(dataList, 1, function(data, callback) {
                var zizhiList = {};
                let zizhiname = data.zizhiname;
                let zizhilevel = data.zizhilevel;
                let zizhiscope = data.zizhiscope;
                let zizhikey = zizhiname + '::' + zizhilevel;
                let zizhiobj = {
                    'zizhiname': zizhiname,
                    'zizhilevel': zizhilevel,
                    'zizhiscope': zizhiscope
                }
                // process company
                try {
                    self.zizhiDB.insertDB('zizhiinfo', zizhiobj, ['zizhiid'], ['zizhiname', 'zizhilevel']).then((res)=>{
                        console.log(res);
                        let zizhiid = res.primarykey;
                        delete res.primarykey;
                        let zizhikey = res.zizhiname + '::' + res.zizhilevel;
                        res.zizhiid = zizhiid;
                        zizhiList[zizhikey] = res;
                        console.log('End Add ZiZhi');
                        callback();
                        // self.zizhiDB.closeConnection();
                    }).catch((error) => {
                        // self.zizhiDB.closeConnection();
                        console.log('Error:' + error);
                        callback();
                    });
                } catch(e) {
                    // self.zizhiDB.closeConnection();
                    console.log('Error:' + e);
                }
            }, function (err) {
                resolve();
            });
        });
    }
    async getCompanyAndZiZhi() {
        var self = this;
        var companyList = await self.zizhiDB.queryDB('companyinfo');
        var zizhiList = await self.zizhiDB.queryDB('zizhiinfo');
        return {companyList, zizhiList}
    }
    processCompanyZiZhi(datalist) {
        var self = this;
        return new Promise(async function(resolve, reject) {
            self.getCompanyAndZiZhi().then( async (infoObj) => {
                let companylist = infoObj.companyList;
                let zizhilist = infoObj.zizhiList;
                let zizhimap = {};
                let companymap = {};
                for (let i = 0; i < companylist.length; i++) {
                    let companyInfo = companylist[i];
                    let companycode = companyInfo.companycode;
                    let companyname = companyInfo.companyname;
                    let companyid = companyInfo.companyid;
                    let companykey = companycode + '::' + companyname;
                    companymap[companykey] = companyid;
                }
                for (let i = 0; i < zizhilist.length; i++) {
                    let zizhiInfo = zizhilist[i];
                    let zizhiname = zizhiInfo.zizhiname;
                    let zizhilevel = zizhiInfo.zizhilevel;
                    let zizhiid = zizhiInfo.zizhiid;
                    let zizhikey = zizhiname + '::' + zizhilevel;
                    zizhimap[zizhikey] = zizhiid;
                }
                for (let i = 0; i < datalist.length; i++) {
                    var data = datalist[i];
                    let companykey = data.companycode + '::' + data.companyname;
                    let zizhikey = data.zizhiname + '::' + data.zizhilevel;
                    let companyid = companymap[companykey];
                    let zizhiid = zizhimap[zizhikey];
                    let zizhiapprovedate = data.zizhiapprovedate + ' 00:00:00';
                    let zizhivaliduntildate = data.zizhivaliduntildate + ' 00:00:00';
                    let companyZiZhiItem = {
                        companyid: companyid,
                        zizhiid: zizhiid,
                        zizhiapprovedate: zizhiapprovedate,
                        zizhivaliduntildate: zizhivaliduntildate
                    };
                    try {
                        await self.zizhiDB.insertDB('companyzizhi', companyZiZhiItem, [], ['companyid', 'zizhiid']);
                    } catch (e) {
                        console.log(e);
                    }
                }
                console.log('------------------all company zizhi processed');
                resolve();
            });
        });
    }

    async exportCompanyToCSV (filename) {
        var self = this;
        if (!filename) {
            let errorMsg = 'exportCompanyToCSV Error: Filename is mandatory';
            console.log(errorMsg);
            throw errorMsg;
        }
        let query = 'select a.companycode, a.companyname, a.companycategory, b.contacttype, b.contactinfo from zizhifiles.companyinfo a, zizhifiles.contactinfo b, zizhifiles.companycontact c where a.companyid = c.companyid and b.contactid = c.contactid and b.contacttypeid<>\'CITY\' and b.contacttypeid<>\'DISTRICT\' order by a.companyid, b.contacttype';
            let companyContactDataList = await self.zizhiDB.queryComplex(query);
            var csvStream = csv.createWriteStream({headers: true}),
            writableStream = fs.createWriteStream(filename);
    
            writableStream.on("finish", function(){
                self.zizhiDB.closeConnection();
                console.log("DONE!");
            });
            csvStream.pipe(writableStream);
            let previousCompanyCode = '';
            for (let i = 0; i < companyContactDataList.length; i++) {
                let companyContact = companyContactDataList[i];
                let companycode = companyContact.companycode;
                let companyname = companyContact.companyname;
                let companycategory = companyContact.companycategory;
                if (previousCompanyCode == companycode) {
                    companycode = '';
                    companyname = '';
                    companycategory = '';
                }
                previousCompanyCode = companyContact.companycode;
    
                let companyContactCVSObj = {
                    '公司代号': companycode,
                    '公司名字': companyname,
                    '类型': companycategory,
                    '联系方式类型': companyContact.contacttype,
                    '联系方式': companyContact.contactinfo
                };
                // console.log(companyContactCVSObj)
                
                csvStream.write(companyContactCVSObj);
            }
            csvStream.end();
    }
}
var utils = new ZiZhiUtils();
//utils.importCSVFile('/Users/i326432/Documents/上海设计企业资质名录.csv', '设计企业', '上海', ['companycode', 'companyname', 'zizhiname', 'zizhilevel', 'zizhiscope', 'zizhiapprovedate', 'zizhivaliduntildate']);
utils.exportCompanyToCSV('my.csv');
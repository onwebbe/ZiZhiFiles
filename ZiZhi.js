'use strict';
const csv = require('fast-csv');
const async = require('async');
const MySQLCompanyZiZhi = require('./mysql/MySQLCompanyZiZhi');
var zizhiDB = new MySQLCompanyZiZhi();
var dataList = [];
csv
	.fromPath("/Users/i326432/Documents/上海设计企业资质名录.csv", {headers : ['companycode', 'companyname', 'zizhiname', 'zizhilevel', 'zizhiscope', 'zizhiapprovedate', 'zizhivaliduntildate']})
	.on("data", function(data){
        // processCompany(data);
        // processZizhi(data);
        dataList.push(data);
	})
	.on("end", function(){
        setTimeout(async function () {
            // await processCompany(dataList);
            // await processZizhi(dataList);
            // await processCompanyZiZhi(dataList);
            await processContact(dataList);
        }, 1);
     console.log("done");
	});
function exportCompanyToCSV () {
    let query = 'select a.companycode, a.companyname, a.companycategory, b.contacttype, b.contactinfo from zizhifiles.companyinfo a, zizhifiles.contactinfo b, zizhifiles.companycontact c where a.companyid = c.companyid and b.contactid = c.contactid order by a.companyid';
    
}
async function processContact(dataList) {
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
                            let returnObj = await zizhiDB.insertDB('contactinfo', contactInfo, ['contactid'], ['contactid']);
                            let primaryKey = returnObj['primarykey'];
                            let contactcompany = {
                                'companyid': companyid,
                                'contactid': primaryKey
                            }
                            await zizhiDB.insertDB('companycontact', contactcompany, [], ['companyid', 'contactid']);
                        }
                    }
                    if (emailList != null && emailList.length > 0) {
                        for (let j = 0; j < emailList.length; j++) {
                            let contactInfo = {
                                'contacttype': '电子邮箱',
                                'contactinfo': emailList[j]
                            };
                            let returnObj = await zizhiDB.insertDB('contactinfo', contactInfo, ['contactid'], ['contactid']);
                            let primaryKey = returnObj['primarykey'];
                            let contactcompany = {
                                'companyid': companyid,
                                'contactid': primaryKey
                            }
                            await zizhiDB.insertDB('companycontact', contactcompany, [], ['companyid', 'contactid']);
                        }
                    }
                    let contactInfo = {
                        'contacttype': '注册城市',
                        'contactinfo': addressCity
                    };
                    let returnObj = await zizhiDB.insertDB('contactinfo', contactInfo, ['contactid'], ['contactid']);
                    let primaryKey = returnObj['primarykey'];
                    let contactcompany = {
                        'companyid': companyid,
                        'contactid': primaryKey
                    }
                    await zizhiDB.insertDB('companycontact', contactcompany, [], ['companyid', 'contactid']);

                    contactInfo = {
                        'contacttype': '注册区域',
                        'contactinfo': addressDisrict
                    };
                    returnObj = await zizhiDB.insertDB('contactinfo', contactInfo, ['contactid'], ['contactid']);
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
async function processCompany(dataList) {
    return new Promise(async function(resolve, reject) {
        async.eachLimit(dataList, 1, function(data, callback) {
            let companykey = data.companycode + '::' + data.companyname;
            var companyInfo = {
                'companycode': data.companycode,
                'companyname': data.companyname,
                'companycategory': '设计企业',
                'companylocation': '上海'
            }
            let companylist = {};
            try {
                zizhiDB.insertDB('companyinfo', companyInfo, ['companyid'], ['companycode', 'companyname']).then((res)=>{
                    console.log(res);
                    let companyid = res.primarykey;
                    delete res.primarykey;
                    let companykey = res.companycode + '::' + res.companyname;
                    res.companyid = companyid;
                    companylist[companykey] = res;
                    console.log('End Add Company');
                    // zizhiDB.closeConnection();
                    callback();
                }).catch((error) => {
                    // zizhiDB.closeConnection();
                    console.log('Error:' + error);
                    callback();
                });
            } catch(e) {
                // zizhiDB.closeConnection();
                console.log('Error:' + e);
                callback();
            }
        }, function (err) {
            resolve();
        });
    });
}
async function processZizhi(dataList) {
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
                zizhiDB.insertDB('zizhiinfo', zizhiobj, ['zizhiid'], ['zizhiname', 'zizhilevel']).then((res)=>{
                    console.log(res);
                    let zizhiid = res.primarykey;
                    delete res.primarykey;
                    let zizhikey = res.zizhiname + '::' + res.zizhilevel;
                    res.zizhiid = zizhiid;
                    zizhiList[zizhikey] = res;
                    console.log('End Add ZiZhi');
                    callback();
                    // zizhiDB.closeConnection();
                }).catch((error) => {
                    // zizhiDB.closeConnection();
                    console.log('Error:' + error);
                    callback();
                });
            } catch(e) {
                // zizhiDB.closeConnection();
                console.log('Error:' + e);
            }
        }, function (err) {
            resolve();
        });
    });
}
async function getCompanyAndZiZhi() {
    var companyList = await zizhiDB.queryDB('companyinfo');
    var zizhiList = await zizhiDB.queryDB('zizhiinfo');
    return {companyList, zizhiList}
}
function processCompanyZiZhi(datalist) {
    return new Promise(async function(resolve, reject) {
        getCompanyAndZiZhi().then( (infoObj) => {
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
                    zizhiDB.insertDB('companyzizhi', companyZiZhiItem, [], ['companyid', 'zizhiid']);
                } catch (e) {
                    console.log(e);
                }
                
            }
            zizhiDB.closeConnection();
        }, function () {
            resolve();
        });
    });
}

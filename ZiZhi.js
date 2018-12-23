'use strict';
const csv = require("fast-csv");
const MySQLCompanyZiZhi = require('./mysql/MySQLCompanyZiZhi');
var zizhiDB = new MySQLCompanyZiZhi();
var dataList = []
csv
	.fromPath("/Users/i326432/Documents/上海施工企业资质企业名录.csv", {headers : ['companycode', 'companyname', 'zizhiname', 'zizhilevel', 'zizhiscope', 'zizhiapprovedate', 'zizhivaliduntildate']})
	.on("data", function(data){
        //processCompany(data);
        // processZizhi(data);
        dataList.push(data);
	})
	.on("end", function(){
        setTimeout(function () {
            processCompanyZiZhi(dataList);
        }, 5000);
     console.log("done");
	});


function processCompany(data) {
	let companylist = {};
    let companykey = data.companycode + '::' + data.companyname;
    var companyInfo = {
        'companycode': data.companycode,
        'companyname': data.companyname
    }
    
    // process company
    try {
        zizhiDB.insertDB('companyinfo', companyInfo, ['companyid'], ['companycode', 'companyname']).then((res)=>{
            console.log(res);
            let companyid = res.primarykey;
            delete res.primarykey;
            let companykey = res.companycode + '::' + res.companyname;
            res.companyid = companyid;
            companylist[companykey] = res;
            console.log('End Add Company');
            zizhiDB.closeConnection();
        }).catch((error) => {
            zizhiDB.closeConnection();
            console.log('Error:' + error);
        });
    } catch(e) {
        zizhiDB.closeConnection();
        console.log('Error:' + e);
    }
	
}
function processZizhi(data) {
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
            zizhiDB.closeConnection();
        }).catch((error) => {
            zizhiDB.closeConnection();
            console.log('Error:' + error);
        });
    } catch(e) {
        zizhiDB.closeConnection();
        console.log('Error:' + e);
    }
}
async function getCompanyAndZiZhi() {
    var companyList = await zizhiDB.queryDB('companyinfo');
    var zizhiList = await zizhiDB.queryDB('zizhiinfo');
    return {companyList, zizhiList}
}
function processCompanyZiZhi(datalist) {
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
    } );
	
}


var csv = require("fast-csv");
csv
	.fromPath("/Users/i326432/Documents/上海施工企业资质企业名录.csv", {headers : ['companycode', 'companyname', 'zizhiname', 'zizhilevel', 'zizhiscope', 'zizhiapprovedate', 'zizhivaliduntildate']})
	.on("data", function(data){
		console.log(data);
	})
	.on("end", function(){
     console.log("done");
	});


function processCompany(datalist) {
	let companylist = {};
	for (let i = 0; i < datalist.length; i++) {
		let data = datalist[i];
		let companykey = data.companycode + '::' + data.companyname;
		var companyInfo = {
			'companycode': data.companycode,
			'companyname': data.companyname
		}
		companylist[companykey] = companyInfo;
		for(let key in companylist) {
			let companyInfo = companylist[key];
			// process company
		}
	}
	
}
function processZizhi(datalist) {
	var zizhiList = {};
	for (let i = 0; i < datalist.length; i++) {
		let data = datalist[i];
		let zizhiname = data.zizhiname;
		let zizhilevel = data.zizhilevel;
		let zizhiscope = data.zizhiscope;
		let zizhikey = zizhiname + '::' + zizhilevel;
		zizhiList[zizhikey] = {
			'zizhiname': zizhiname,
			'zizhilevel': zizhilevel,
			'zizhiscope': zizhiscope
		}
	}
	for(let key in zizhiList) {
		let zizhidata = zizhiList[key];
		//process zizhi
	}
}

function processCompanyZiZhi(datalist, companylist, zizhilist) {
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
		let zizhiapprovedate = data.zizhiapprovedate + '00:00:00';
		let zizhivaliduntildate = data.zizhivaliduntildate + '00:00:00';
	}
}
var mysql      = require('mysql');

function MySQLZiZhi(){
    var self = this;
    this.connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '123456',
        database : 'zizhifiles'
      });
    this.connection.connect();
      
}
MySQLZiZhi.prototype.closeConnection = function () {
    this.connection.end();
}
MySQLZiZhi.prototype.queryCompanyInfo = function (callback, fields, values, isOr) {
    if (fields.length !== values.length) {
        console.log('queryCompanyInfo Error: values and fields count should be the same');
        callback(1, 'queryCompanyInfo Error: values and fields count should be the same');
        return;
    }
    let queryString = 'SELECT * from companyinfo where';
    for ( let i = 0; i < fields.length; i++ ) {
        let field = fields[i];
        if ( i === 0 ) {
            queryString += ' ' + field + '= ?';
        } else {
            if (isOr) {
                queryString += ' OR ' + field + '= ?';
            } else {
                queryString += ' AND ' + field + '= ?';
            }
            
        }
    }
    let queryParams = values;
    this.connection.query(queryString, queryParams, function (error, results, fields) {
        if (error) {
            let errorMessage = 'queryCompanyInfo Error:' + error.message + ':' + queryString + ':' + queryParams.join(',');
            console.log(errorMessage);
            callback(1, errorMessage);
        }
        callback(0, results);
    });
}
MySQLZiZhi.prototype.insertCompanyInfo = function (callback, companyinfo) {
    var self = this;
    if (companyinfo === null) {
        callback(1, 'insertCompanyInfo error: param for companyinfo could not be null');
        console.log('insertCompanyInfo error: param for companyinfo could not be null');
        return;
    }
    if (!companyinfo.companycode) {
        callback(1, 'insertCompanyInfo error: companycode field for companyinfo is mandatory');
        console.log('insertCompanyInfo error: companycode field for companyinfo is mandatory');
        return;
    }
    if (!companyinfo.companyname) {
        callback(1, 'insertCompanyInfo error: companyname field for companyinfo is mandatory');
        console.log('insertCompanyInfo error: companyname field for companyinfo is mandatory')
        return;
    }
    let companycode = companyinfo.companycode;
    let companyname = companyinfo.companyname;
    // duplicated company could not be insert
    this.queryCompanyInfo( function (code, data) {
        if (code === 0 && data.length === 0) {
            let fieldList = [];
            let valueList = [];
            for ( let infofield in companyinfo) {
                if (infofield !== 'companyid') { // company id is system generated auto increase field, could not manually assign the value
                    fieldList.push(infofield);
                    valueList.push(companyinfo[infofield]);
                }
            }
            let queryString = 'insert into companyinfo (';
            let valuesQueryString = '';
            for (let i = 0; i < fieldList.length; i++) {
                if ( i === 0 ) {
                    queryString += fieldList[i];
                    valuesQueryString += '?';
                } else {
                    queryString += ',' + fieldList[i];
                    valuesQueryString += ', ?';
                }
            }
            queryString += ') values (' + valuesQueryString + ')';
            let queryParams = valueList;
            self.connection.query(queryString, queryParams, function (error, results, fields) {
                if (error) {
                    let errorMessage = 'insertCompanyInfo Error:' + error.message;
                    console.log(errorMessage);
                    callback(1, errorMessage);
                }
                callback(0, results);
            });
        } else {
            let errorMessage = 'insertCompanyInfo Error: Could not insert the company with same name or code';
                    console.log(errorMessage);
                    callback(1, errorMessage);
        }
    }, ['companycode', 'companyname'], [companycode, companyname], true);
}
MySQLZiZhi.prototype.updateCompanyInfo = function(callback, query, companyinfo) {
    if (!query) {
        callback(1, 'updateCompanyInfo error: query data could not be null');
        console.log('updateCompanyInfo error: query data could not be null');
        return;
    }
    if (!query.fields && !query.values && query.fields.length != query.values.length) {
        callback(1, 'updateCompanyInfo error: query fields or values should not be null and must be the same count');
        console.log('updateCompanyInfo error: query fields or values should not be null and must be the same count');
        return;
    }
    
    if (!companyinfo) {
        callback(1, 'updateCompanyInfo error: update data could not be null');
        console.log('updateCompanyInfo error: update data could not be null');
        return;
    }
    
    let paramters = [];

    let setString = ' SET ';
    let fieldList = [];
    let valueList = [];
    for ( let infofield in companyinfo) {
        if (infofield !== 'companyid' && infofield !== 'companyname' && infofield !== 'companycode') { // company id, company name, company code could not be update
            fieldList.push(infofield);
            valueList.push(companyinfo[infofield]);
        }
    }
    for ( let i = 0; i < fieldList.length; i++ ) {
        let field = fieldList[i];
        let value = valueList[i];
        if ( i === 0 ) {
            setString += ' ' + field + '= ?';
        } else {
            setString += ', ' + field + '= ?';
        }
        paramters.push(value);
    }

    let queryString = ' WHERE ';
    for ( let i = 0; i < query.fields.length; i++ ) {
        let field = query.fields[i];
        let value = query.values[i];
        if ( i === 0 ) {
            queryString += ' ' + field + '= ?';
        } else {
            queryString += ' AND ' + field + '= ?';
        }
        paramters.push(value);
    }

    let updateString = 'update companyinfo ' + setString + queryString;
    console.log(updateString);
}
var test = new MySQLZiZhi();
// test.insertCompanyInfo(function (code, result) {
//     test.closeConnection();
// }, {
//     'companycode': '1231',
//     'companyname': '这是个测试公司1',
//     'companylocation': '上海',
//     'companycategory': ''
// })

test.updateCompanyInfo(function () {

}, {fields:['companycode', 'companyname'], values:['123', '111']},
    {
        companylocation: '111111',
        companyname: '123',
        companyaaa: 'abc'
    }
);
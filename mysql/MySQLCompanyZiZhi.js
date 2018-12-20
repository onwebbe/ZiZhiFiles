const mysql      = require('mysql');
class MySQLCompanyZiZhi {
  constructor() {
    this.createConnection();
  }
  createConnection() {
    var self = this;
    this.connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '123456',
        database : 'zizhifiles'
      });
    this.connection.connect();
    this.isConnected = true;
  }
  closeConnection (callback) {
      this.connection.end();
      this.isConnected = false;
  }
  _isDataInList(data, list) {
    for (let i = 0; i < list.length; i++) {
      if (data === list[i]) {
        return true;
      }
    }
    return false;
  }
  async insertDB(tablename, insertData, excludeFields, checkUniqueFields) {
    var self = this;
    return new Promise(async function(resolve, reject) {
      var dupCheckData = {};
      for (let i = 0; i < checkUniqueFields.length; i++) {
        let fieldName = checkUniqueFields[i];
        let fieldValue = insertData[fieldName];
        dupCheckData[fieldName] = fieldValue;
      }
      var checkDuplicateResult = await self.queryDB(tablename, dupCheckData, true);
      if (checkDuplicateResult.length === 0) {
        let queryParams = [];
        let queryString = 'insert into ' + tablename + ' (';
        let valuesQueryString = '';
        let i = 0;
        for (let infofield in insertData) {
          if (self._isDataInList(infofield, excludeFields)) { // company id is system generated auto increase field, could not manually assign the value
            if ( i === 0 ) {
              queryString += infofield;
              valuesQueryString += '?';
            } else {
                queryString += ',' + infofield;
                valuesQueryString += ', ?';
            }
            queryParams.push(insertData[infofield]);
            i++;
          }
        }
        queryString += ') values (' + valuesQueryString + ')';
        self.connection.query(queryString, queryParams, function (error, results, fields) {
          if (error) {
              let errorMessage = 'insertDB Error:' + error.message;
              console.log(errorMessage);
              reject(errorMessage);
          }
          resolve(results);
        });
      } else {
        let errorMessage = 'insertDB Error: duplicated with data:' + dupCheckData;
        console.log(errorMessage);
        reject(errorMessage);
      }
    });
  }
  async queryDB(tablename, queryData, isOr) {
    var self = this;
    return new Promise(function(resolve, reject) {
        if (!queryData) {
            console.log('queryDB Error: queryData should not be null');
            reject('queryDB Error: queryData should not be null');
            return;
        }
        let queryString = 'SELECT * from ' + tablename + ' where';
        let queryParams = [];
        let i = 0;
        for (let field in queryData) {
            if ( i === 0 ) {
                queryString += ' ' + field + '= ?';
            } else {
                if (isOr) {
                    queryString += ' OR ' + field + '= ?';
                } else {
                    queryString += ' AND ' + field + '= ?';
                }
                
            }
            queryParams.push(queryData[field]);
            i++;
        }
        
        self.connection.query(queryString, queryParams, function (error, results, fields) {
            if (error) {
                let errorMessage = 'queryDB Error:' + error.message + ':' + queryString + ':' + queryParams.join(',');
                console.log(errorMessage);
                reject(errorMessage);
            }
            resolve(results);
        });
    });
  }
}

var t = new MySQLCompanyZiZhi();
// try {
//   t.queryDB('companyinfo', {'companycode': '123'}, true).then((res)=>{
//     console.log(res);
//     t.closeConnection();
//   }).catch((error) => {
//     console.log('Error:' + error);
//   });
// } catch(e) {
//   t.closeConnection();
//   console.log('Error:' + e);
// }
try {
  t.insertDB('companyinfo', {
        'companyid': 111,
        'companycode': '1232x',
        'companyname': '这是个测试公司2x',
        'companylocation': '上海',
        'companycategory': ''
    }, ['companyid'], ['companycode', 'companyname']).then((res)=>{
    console.log(res);
    t.closeConnection();
  }).catch((error) => {
    console.log('Error:' + error);
  });
} catch(e) {
  t.closeConnection();
  console.log('Error:' + e);
}
  
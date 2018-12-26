'use strict';

const mysql      = require('mysql');
class MySQLCompanyZiZhi {
  constructor() {
    this.activeTransactionCount = 0;
    this.createConnection();
  }
  createConnection() {
    var self = this;
    try {
      self.connection.end();
    } catch(e) {

    }
    this.connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '123456',
        database : 'zizhifiles'
      });
    this.connection.connect();
    this.isConnected = true;
  }
  closeConnection(callback) {
    var self = this;
    if (self._activeTransactionTimer == null) {
      this._activeTransactionTimer = setInterval(() => {
        if (self.activeTransactionCount == 0) {
          self.connection.end();
          self.connection.destroy();
          self.isConnected = false;
          console.log('---------------END-----------------');
          clearInterval(self._activeTransactionTimer);
          self._activeTransactionTimer = null;
        }
      }, 100);
    }
  }
  startTransaction() {
    this.activeTransactionCount ++;
    if (!this.isConnected) {
      this.createConnection();
    }
  }
  endTransaction() {
    this.activeTransactionCount --;
  }
  handleDBError(reject, msg) {
    this.endTransaction();
    console.log(msg);
    reject(msg);
  }
  _isDataInList(data, list) {
    if (data == null || list == null) {
      return false;
    }
    for (let i = 0; i < list.length; i++) {
      if (data === list[i]) {
        return true;
      }
    }
    return false;
  }
  queryComplex(queryString, queryParams) {
    var self = this;
    this.startTransaction();
    if (queryParams == null) {
      queryParams = [];
    }
    return new Promise(async function(resolve, reject) {
      if (!queryString) {
        self.handleDBError(reject, 'queryComplex Error: query string is mandatory');
      }
      console.log(queryString);
      self.connection.query(queryString, queryParams, function (error, results, fields) {
        if (error || !results) {
            let errorMessage = 'queryComplex Error:' + error.message;
            self.handleDBError(reject, errorMessage);
        }
        self.endTransaction();
        resolve(results);
      });
    });
  }
  insertDB(tablename, insertData, excludeFields, checkUniqueFields) {
    var self = this;
    this.startTransaction();
    return new Promise(async function(resolve, reject) {
      if (!tablename) {
        self.handleDBError(reject, 'queryDB Error: table name is mandatory');
      }
      if (!insertData) {
        self.handleDBError(reject, 'queryDB Error: insert data field is mandatory');
      }

      let checkDuplicateResult = []; // default, no need to check the duplicated data or not
      if (checkUniqueFields != null && checkUniqueFields.length > 0) {
        var dupCheckData = {};
        for (let i = 0; i < checkUniqueFields.length; i++) {
          let fieldName = checkUniqueFields[i];
          let fieldValue = insertData[fieldName];
          dupCheckData[fieldName] = fieldValue;
        }
        checkDuplicateResult = await self.queryDB(tablename, dupCheckData, false);
      }
      if (checkDuplicateResult.length === 0) {
        let queryParams = [];
        let queryString = 'insert into ' + tablename + ' (';
        let valuesQueryString = '';
        let i = 0;
        for (let infofield in insertData) {
          if (!self._isDataInList(infofield, excludeFields)) { // company id is system generated auto increase field, could not manually assign the value
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
        console.log(queryString);
        self.connection.query(queryString, queryParams, function (error, results, fields) {
          if (error || !results) {
              let errorMessage = 'insertDB Error:' + error.message;
              self.handleDBError(reject, errorMessage);
          }
          insertData['primarykey'] = results.insertId;
          self.endTransaction();
          resolve(insertData);
        });
      } else {
        let errorMessage = 'insertDB Error: duplicated with data:' + JSON.stringify(dupCheckData, null, 2);
        self.handleDBError(reject, errorMessage);
      }
    });
  }
  queryDB(tablename, queryData, isOr) {
    var self = this;
    this.startTransaction();
    return new Promise(function(resolve, reject) {
      if (!tablename) {
        self.handleDBError(reject, 'queryDB Error: table name is mandatory');
      }
      let queryString = 'SELECT * from ' + tablename + ' ';
      let queryParams = [];
      if (queryData != null) {
        queryString += ' WHERE ';
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
      }
      console.log(queryString);
      self.connection.query(queryString, queryParams, function (error, results, fields) {
          if (error) {
              let errorMessage = 'queryDB Error:' + error.message + ':' + queryString + ':' + queryParams.join(',');
              self.handleDBError(reject, errorMessage);
          }
          self.endTransaction();
          resolve(results);
      });
    });
  }

  updateDB(tablename, queryData, updateData, excludeFields) {
    var self = this;
    this.startTransaction();
    return new Promise(function(resolve, reject) {
      if (!tablename) {
        self.handleDBError(reject, 'updateDB Error: table name is mandatory');
      }
      if (!queryData) {
        self.handleDBError(reject, 'updateDB Error: query Data is mandatory');
      }
      let paramters = [];
      let setString = ' SET ';
      let fieldList = [];
      let valueList = [];
      let i = 0;
      for ( let infofield in updateData) {
          if (!self._isDataInList(infofield, excludeFields)) {
            if ( i === 0 ) {
              setString += ' ' + infofield + '= ?';
            } else {
              setString += ', ' + infofield + '= ?';
            }
            paramters.push(updateData[infofield]);
          }
          i++;
      }
      let queryString = ' WHERE ';
      i = 0;
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
          paramters.push(queryData[field]);
          i++;
      }
  
      let updateString = 'update ' + tablename + ' ' + setString + queryString;
      console.log(updateString);
      self.connection.query(updateString, paramters, function (error, results, fields) {
          if (error) {
              let errorMessage = 'updateDB Error:' + error.message;
              self.handleDBError(reject, errorMessage);
          }
          self.endTransaction();
          resolve(results);
      });
    });
  }
}
exports.default = MySQLCompanyZiZhi;
module.exports = exports['default'];
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
// try {
//   t.insertDB('companyinfo', {
//         'companyid': 111,
//         'companycode': '1232x123x',
//         'companyname': '这是个测试公司2123xx',
//         'companylocation': '上海',
//         'companycategory': ''
//     }, ['companyid'], ['companycode', 'companyname']).then((res)=>{
//     console.log(res);
//     t.closeConnection();
//   }).catch((error) => {
//     t.closeConnection();
//     console.log('Error:' + error);
//   });
// } catch(e) {
//   t.closeConnection();
//   console.log('Error:' + e);
// }

// try {
//   t.updateDB('companyinfo', {
//         'companyname': '博华建筑规划设计有限公司',
        
//     }, {
//       'tianyanchaurl': 'abcd123'
//     }).then((res)=>{
//     console.log(res);
//     t.closeConnection();
//   }).catch((error) => {
//     t.closeConnection();
//     console.log('Error:' + error);
//   });
// } catch(e) {
//   t.closeConnection();
//   console.log('Error:' + e);
// }


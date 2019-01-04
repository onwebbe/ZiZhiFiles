'use strict';
const config = require('config');
const mysql = require('mysql');
const logger = require('../Logger');
class MySQLCompanyZiZhi {
  constructor() {
    this.mysql = mysql;
    this.isConnected = false;
    this.activeTransactionCount = 0;
    // this.createConnection();
  }
  createConnection() {
    var self = this;
    logger.debug('MySQLCompanyZiZhi:createConnection:start');
    try {
      if (self.connection) {
        self.connection.end();
      }
    } catch (e) {
      logger.error('MySQLCompanyZiZhi:createConnection:Error ' + e);
    }
    this.connection = mysql.createConnection({
      host: config.databaseConfig.host,
      user: config.databaseConfig.user,
      password: config.databaseConfig.password,
      database: config.databaseConfig.database
    });
    this.connection.connect();
    this.isConnected = true;
  }
  closeConnection(callback) {
    var self = this;
    self.isConnected = false;
    self.connection.end();
    // if (self._activeTransactionTimer == null) {
    //   this._activeTransactionTimer = setInterval(() => {
    //     logger.debug('MySQLCompanyZiZhi:closeConnection activeTrx:' + self.activeTransactionCount);
    //     if (self.activeTransactionCount == 0) {
    //       self.connection.end();
    //       self.connection.destroy();
    //       self.isConnected = false;
    //       logger.debug('MySQLCompanyZiZhi:closeConnection:---------------END-----------------');
    //       clearInterval(self._activeTransactionTimer);
    //       self._activeTransactionTimer = null;
    //     }
    //   }, 100);
    // }
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
    logger.error('MySQLCompanyZiZhi:handleDBError:msg:' + msg);
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
        self.handleDBError(reject, 'MySQLCompanyZiZhi:queryComplex:Error: query string is mandatory');
      }
      logger.debug('MySQLCompanyZiZhi:queryComplex:QueryString:' + queryString);
      logger.debug(queryParams);
      self.connection.query(queryString, queryParams, function (error, results, fields) {
        if (error || !results) {
          let errorMessage = 'MySQLCompanyZiZhi:queryComplex:Error:' + error.message;
          self.handleDBError(reject, errorMessage);
        } else {
          self.endTransaction();
          resolve(results);
        }
      });
    });
  }
  insertDB(tablename, insertData, excludeFields, checkUniqueFields) {
    var self = this;
    this.startTransaction();
    return new Promise(async function(resolve, reject) {
      if (!tablename) {
        self.handleDBError(reject, 'MySQLCompanyZiZhi:queryDB:Error: table name is mandatory');
      } else if (!insertData) {
        self.handleDBError(reject, 'MySQLCompanyZiZhi:queryDB:Error: insert data field is mandatory');
      } else {
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
          logger.debug('MySQLCompanyZiZhi:insertDB:queryString' + queryString);
          logger.debug(queryParams);
          self.connection.query(queryString, queryParams, function (error, results, fields) {
            if (error) {
              let errorMessage = 'MySQLCompanyZiZhi:insertDB:Error:' + error.message;
              self.handleDBError(reject, errorMessage);
            } else {
              insertData.primarykey = results.insertId;
              self.endTransaction();
              resolve(insertData);
            }
          });
        } else {
          let errorMessage = 'MySQLCompanyZiZhi:insertDB:Error: duplicated with data:' + JSON.stringify(dupCheckData, null, 2);
          self.handleDBError(reject, errorMessage);
        }
      }
    });
  }
  queryDB(tablename, queryData, isOr) {
    var self = this;
    this.startTransaction();
    return new Promise(function(resolve, reject) {
      if (!tablename) {
        self.handleDBError(reject, 'MySQLCompanyZiZhi:queryDB:Error: table name is mandatory');
      } else {
        let queryString = 'SELECT * FROM ' + tablename + ' ';
        let queryParams = [];
        if (queryData != null) {
          queryString += ' WHERE ';
          let i = 0;
          for (let field in queryData) {
            if (Object.prototype.hasOwnProperty.call(queryData, field)) {
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
        }
        logger.debug('MySQLCompanyZiZhi:queryDB:queryString:' + queryString);
        logger.debug(queryParams);
        self.connection.query(queryString, queryParams, function (error, results, fields) {
          if (error) {
            let errorMessage = 'MySQLCompanyZiZhi:queryDB:Error:' + error.message + ':' + queryString + ':' + queryParams.join(',');
            self.handleDBError(reject, errorMessage);
          } else {
            self.endTransaction();
            resolve(results);
          }
        });
      }
    });
  }

  updateDB(tablename, queryData, updateData, excludeFields) {
    var self = this;
    this.startTransaction();
    return new Promise(function(resolve, reject) {
      if (!tablename) {
        self.handleDBError(reject, 'MySQLCompanyZiZhi:updateDB:Error: table name is mandatory');
      }
      if (!queryData) {
        self.handleDBError(reject, 'MySQLCompanyZiZhi:updateDB:Error: query Data is mandatory');
      }
      let paramters = [];
      let setString = ' SET ';
      let i = 0;
      for ( let infofield in updateData) {
        if (Object.prototype.hasOwnProperty.call(updateData, infofield)) {
          if (!self._isDataInList(infofield, excludeFields)) {
            if ( i === 0 ) {
              setString += ' ' + infofield + '= ?';
            } else {
              setString += ', ' + infofield + '= ?';
            }
            paramters.push(updateData[infofield]);
            i++;
          }
        }
      }
      let queryString = ' WHERE ';
      i = 0;
      for (let field in queryData) {
        if (Object.prototype.hasOwnProperty.call(queryData, field)) {
          if ( i === 0 ) {
            queryString += ' ' + field + '= ?';
          } else {
            let isOr = false;
            if (isOr) {
              queryString += ' OR ' + field + '= ?';
            } else {
              queryString += ' AND ' + field + '= ?';
            }
          }
          paramters.push(queryData[field]);
          i++;
        }
      }

      let updateString = 'update ' + tablename + ' ' + setString + queryString;
      logger.debug('MySQLCompanyZiZhi:updateDB:queryString:' + updateString);
      logger.debug(paramters);
      self.connection.query(updateString, paramters, function (error, results, fields) {
        if (error) {
          let errorMessage = 'MySQLCompanyZiZhi:updateDB:Error:' + error.message;
          self.handleDBError(reject, errorMessage);
        } else {
          self.endTransaction();
          resolve(results);
        }
      });
    });
  }
  queryConfig(category) {
    let self = this;
    return new Promise(function(resolve, reject) {
      try {
        self.queryDB('configurations', {'configcategory': category}, true).then((res) => {
          let configObj = {};
          for (let i = 0; i < res.length; i++) {
            let configItem = res[i];
            let configName = configItem.configname;
            let configValue = configItem.configvalue;
            configObj[configName] = configValue;
          }
          resolve(configObj);
        }).catch((error) => {
          self.handleDBError(reject, error);
        });
      } catch (error) {
        let errorMessage = 'MySQLCompanyZiZhi:queryConfig:Error:' + error;
        self.handleDBError(reject, errorMessage);
      }
    });
  }
}
exports.default = MySQLCompanyZiZhi;
module.exports = exports.default;
// var t = new MySQLCompanyZiZhi();
// try {
//   t.queryDB('configurations', {'configcategory': 'utemail'}, true).then((res) => {
//     logger.info(res);
//     t.closeConnection();
//   }).catch((error) => {
//     logger.info('Error:' + error);
//   });
// } catch(e) {
//   t.closeConnection();
//   logger.error('Error:' + e);
// }
// try {
//   t.insertDB('companyinfo', {
//         'companyid': 2386,
//         'companycode': '1232x123x',
//         'companyname': '这是个测试公司2123xx',
//         'companylocation': '上海',
//         'companycategory': ''
//     }, [], []).then((res)=>{
//     logger.info(res);
//     t.closeConnection();
//   }).catch((error) => {
//     t.closeConnection();
//     logger.error('runtime Error:' + error);
//   });
// } catch(e) {
//   t.closeConnection();
//   logger.error('runtime Error:' + e);
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


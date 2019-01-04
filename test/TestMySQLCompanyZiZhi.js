const MySQLCompanyZiZhi = require('../src/mysql/MySQLCompanyZiZhi');
const {assert} = require('chai');
const sinon = require('sinon');
const logger = require('../src/Logger.js');

describe('Test MySQLCompanyZiZhi', function() {
  let pickTestMatrix = {
    'test1': it,
    'test2': it
  };
  let zizhiDB = new MySQLCompanyZiZhi();
  let currentLogLever = null;
  before(function() {
    currentLogLever = logger.level;
    logger.level = 'off';
  });

  after(function () {
    logger.level = currentLogLever;
  });

  beforeEach( () => {
    sinon.stub(zizhiDB.mysql, 'createConnection').callsFake( () => {
      return {
        end: function () {
          
        },
        query: function () {

        },
        connect: function () {
          
        }
      };
    });
  });

  afterEach( () => {
    sinon.restore();
  });

  pickTestMatrix.test1('create connection, status flag should be true', function() {
    zizhiDB.createConnection();
    assert.equal(zizhiDB.isConnected, true);
    sinon.restore();
  });

  pickTestMatrix.test2('when startTransaction, connection should be active and active trasaction count should be 1', function() {
    zizhiDB.startTransaction();
    // assert.equal(zizhiDB.isConnected, true);
    assert.equal(zizhiDB.activeTransactionCount, 1);
    sinon.restore();
  });

  it('when endTransaction after startTransaction, connection should be active and active trasaction count should be 0', function() {
    zizhiDB.endTransaction();
    // assert.equal(zizhiDB.isConnected, true);
    assert.equal(zizhiDB.activeTransactionCount, 0);
    sinon.restore();
  });

  it('Check data in the list', function() {
    let list = [];
    list.push('field1');
    list.push('field2');
    list.push('field3');
    list.push('field4');
    list.push('field5');
    assert.isTrue(zizhiDB._isDataInList('field2', list));
    assert.isFalse(zizhiDB._isDataInList('field10', list));
  });

  it('when execute queryComplex, could compose a proper query to execute', async function() {
    let query = 'select * from db where userid=? and username<>?';
    let params = ['a', 'b'];
    var stub = sinon.stub(zizhiDB.connection, 'query').callsFake( (queryString, queryParams, callback) => {
      callback(null, ['res1', 'res2']);
    });
    await zizhiDB.queryComplex(query, params);
    sinon.assert.calledWithMatch(stub, query, params);
    // assert.equal(zizhiDB.isConnected, true);
    assert.equal(zizhiDB.activeTransactionCount, 0);
    sinon.restore();
  });

  it('when execute queryDB using and, could compose a proper query to execute and returns the db result', async function() {
    let tablename = 'tablename';
    let queryData = {
      'field1': 'value1',
      'field2': 'value2'
    };
    var stub = sinon.stub(zizhiDB.connection, 'query').callsFake( (queryString, queryParams, callback) => {
      callback(null, ['res1', 'res2']);
    });
    let expectedQuery = 'SELECT * FROM tablename  WHERE  field1= ? AND field2= ?';
    let expectedParams = ['value1', 'value2'];
    await zizhiDB.queryDB(tablename, queryData, false);
    sinon.assert.calledWithMatch(stub, expectedQuery, expectedParams);
    // assert.equal(zizhiDB.isConnected, true);
    assert.equal(zizhiDB.activeTransactionCount, 0);
    sinon.restore();
  });

  it('when execute queryDB using or, could compose a proper query to execute and returns the db result', async function() {
    let tablename = 'tablename';
    let queryData = {
      'field1': 'value1',
      'field2': 'value2'
    };
    var stub = sinon.stub(zizhiDB.connection, 'query').callsFake( (queryString, queryParams, callback) => {
      callback(null, ['res1', 'res2']);
    });
    let expectedQuery = 'SELECT * FROM tablename  WHERE  field1= ? OR field2= ?';
    let expectedParams = ['value1', 'value2'];
    await zizhiDB.queryDB(tablename, queryData, true);
    sinon.assert.calledWithMatch(stub, expectedQuery, expectedParams);
    // assert.equal(zizhiDB.isConnected, true);
    assert.equal(zizhiDB.activeTransactionCount, 0);
    sinon.restore();
  });

  it('when execute queryDB with no tablename, error will be returned', async function() {
    let queryData = {
      'field1': 'value1',
      'field2': 'value2'
    };
    sinon.stub(zizhiDB.connection, 'query').callsFake( (queryString, queryParams, callback) => {
      callback(null, ['res1', 'res2']);
    });
    let isExceptionThrews = null;
    try {
      await zizhiDB.queryDB(null, queryData, true);
    } catch (e) {
      isExceptionThrews = true;
    }
    assert.isTrue(isExceptionThrews);

    // assert.equal(zizhiDB.isConnected, true);
    assert.equal(zizhiDB.activeTransactionCount, 0);
    sinon.restore();
  });


  it('when execute insertDB, will generate proper query to insert', async function() {
    let tablename = 'tablename';
    let insertData = {
      'insertfield1': 'insertvalue1',
      'insertfield2': 'insertvalue2',
      'insertfield3': 'insertvalue3'
    };
    let checkUniqueFields = ['insertfield1', 'insertfield2'];
    let ignoreInsertFieldNames = ['insertfield1', 'insertfield10'];
    let stub = sinon.stub(zizhiDB.connection, 'query').callsFake( (queryString, queryParams, callback) => {
      callback(null, []);
    });
    let isExceptionThrews = false;
    try {
      await zizhiDB.insertDB(tablename, insertData, ignoreInsertFieldNames, checkUniqueFields);
    } catch (e) {
      isExceptionThrews = true;
    }
    let expectedQuery = 'insert into tablename (insertfield2,insertfield3) values (?, ?)';
    let expectedParams = ['insertvalue2', 'insertvalue3'];
    sinon.assert.calledWithMatch(stub.secondCall, expectedQuery, expectedParams);

    // assert.equal(zizhiDB.isConnected, true);
    assert.isFalse(isExceptionThrews);
    assert.equal(zizhiDB.activeTransactionCount, 0);
    sinon.restore();
  });

  it('when execute insertDB, but dedup check get one record', async function() {
    let tablename = 'tablename';
    let insertData = {
      'insertfield1': 'insertvalue1',
      'insertfield2': 'insertvalue2',
      'insertfield3': 'insertvalue3'
    };
    let checkUniqueFields = ['insertfield1', 'insertfield2'];
    let ignoreInsertFieldNames = ['insertfield1', 'insertfield10'];
    sinon.stub(zizhiDB.connection, 'query').callsFake( (queryString, queryParams, callback) => {
      callback(null, ['a']);
    });
    let isExceptionThrews = false;
    try {
      await zizhiDB.insertDB(tablename, insertData, ignoreInsertFieldNames, checkUniqueFields);
    } catch (e) {
      isExceptionThrews = true;
    }
    assert.isTrue(isExceptionThrews);
    // assert.equal(zizhiDB.isConnected, true);
    assert.equal(zizhiDB.activeTransactionCount, 0);
    sinon.restore();
  });

  it('when execute updateDB, system will execute update properly', async function() {
    let tablename = 'tablename';
    let updateData = {
      'insertfield1': 'insertvalue1',
      'insertfield2': 'insertvalue2',
      'insertfield3': 'insertvalue3'
    };
    let queryData = {
      'queryfield1': 'a',
      'queryfield2': 'b'
    };
    let ignoreInsertFieldNames = ['insertfield1', 'insertfield10'];
    let stub = sinon.stub(zizhiDB.connection, 'query').callsFake( (queryString, queryParams, callback) => {
      callback(null, ['a']);
    });
    let isExceptionThrews = false;
    try {
      await zizhiDB.updateDB(tablename, queryData, updateData, ignoreInsertFieldNames);
    } catch (e) {
      isExceptionThrews = true;
    }
    let expectedQueryString = 'update tablename  SET  insertfield2= ?, insertfield3= ? WHERE  queryfield1= ? AND queryfield2= ?';
    let expectedParams = ['insertvalue2', 'insertvalue3', 'a', 'b'];
    assert.isFalse(isExceptionThrews);
    sinon.assert.calledWithMatch(stub, expectedQueryString, expectedParams);
    // assert.equal(zizhiDB.isConnected, true);
    assert.equal(zizhiDB.activeTransactionCount, 0);
    sinon.restore();
  });

  it('when execute updateDB no exclude field, system will execute update properly', async function() {
    let tablename = 'tablename';
    let updateData = {
      'insertfield1': 'insertvalue1',
      'insertfield2': 'insertvalue2',
      'insertfield3': 'insertvalue3'
    };
    let queryData = {
      'queryfield1': 'a',
      'queryfield2': 'b'
    };
    let ignoreInsertFieldNames = [];
    let stub = sinon.stub(zizhiDB.connection, 'query').callsFake( (queryString, queryParams, callback) => {
      callback(null, ['a']);
    });
    let isExceptionThrews = false;
    try {
      await zizhiDB.updateDB(tablename, queryData, updateData, ignoreInsertFieldNames);
    } catch (e) {
      isExceptionThrews = true;
    }
    let expectedQueryString = 'update tablename  SET  insertfield1= ?, insertfield2= ?, insertfield3= ? WHERE  queryfield1= ? AND queryfield2= ?';
    let expectedParams = ['insertvalue1', 'insertvalue2', 'insertvalue3', 'a', 'b'];
    assert.isFalse(isExceptionThrews);
    sinon.assert.calledWithMatch(stub, expectedQueryString, expectedParams);
    // assert.equal(zizhiDB.isConnected, true);
    assert.equal(zizhiDB.activeTransactionCount, 0);
    sinon.restore();
  });

  it('when close the connection, status flag should be false', function() {
    zizhiDB.closeConnection();
    assert.equal(zizhiDB.isConnected, false);
  });
});

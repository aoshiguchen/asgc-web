var type = require('../../../../lib/util/type');
var assert = require('assert');

assert.equal(type.getType('1'),'String');
assert.equal(type.getType(10),'Number');
assert.equal(type.getType(true),'Boolean');
assert.equal(type.getType([]),'Array');
assert.equal(type.getType({}),'Object');
assert.equal(type.getType(undefined),'Undefined');
assert.equal(type.getType(/12/),'RegExp');
assert.equal(type.getType(null),'Null');
assert.equal(type.getType(function(){}),'Function');

assert.ok(type.isString('1'));
assert.ok(type.isNumber(10));
assert.ok(type.isBoolean(true));
assert.ok(type.isArray([]));
assert.ok(type.isObject({}));
assert.ok(type.isUndefined(undefined));
assert.ok(type.isRegExp(/12/));
assert.ok(type.isNull(null));
assert.ok(type.isFunction(function(){}));

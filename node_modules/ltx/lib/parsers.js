'use strict';

var libxmljs = require('./parsers/libxmljs.js');
var ltx = require('./parsers/ltx.js');
var nodeExpat = require('./parsers/node-expat.js');
var nodeXml = require('./parsers/node-xml.js');
var saxJs = require('./parsers/sax-js.js');
var saxes = require('./parsers/saxes.js');

var parsers = [
  libxmljs,
  ltx,
  nodeExpat,
  nodeXml,
  saxJs,
  saxes,
];

module.exports = parsers;

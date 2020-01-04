'use strict';

const expect = require('expect.js');
const bufferEqual = require('buffer-equal');

const Parser = require('../');

/*
Parser {
  header: <Buffer f1 f1 f1 f1>,
  kHeaderLen: 4,
  kControlLen: 8,
  rcvdLen: 0,
  payloadLen: 0,
  rcvd: false,
  buffer: [],
  data: null,
  extra: null }


*/

const HEADER = Buffer.from([0xf1, 0xf1, 0xf1, 0xf1]);
const EMPTY = Buffer.from([]);

describe('basic function', function() {
  it('new Parser should ok', function () {
    let p = new Parser();
    console.log(p);
    expect(p.kHeaderLen).to.be(4);
    expect(p.kControlLen).to.be(8);
    expect(p.rcvdLen).to.be(0);
    expect(p.payloadLen).to.be(0);
    expect(p.data).to.be(null);
    expect(p.extra).to.be(null);
    expect(p.rcvd).to.be(false);
    expect(p.buffer.length).to.be(0);
    expect(bufferEqual(p.header, HEADER)).to.be.ok();
  });



});

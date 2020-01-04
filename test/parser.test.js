'use strict';

const expect = require('expect.js');
const bufferEqual = require('buffer-equal');

const Parser = require('../');

/*
Parser {
  header: <Buffer f1 f1 f1 f1>,
  bytesSync: 4,
  bytesHeader: 8,
  bytesRcvd: 0,
  bytesPayload: 0,
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
    expect(p.bytesSync).to.be(4);
    expect(p.bytesHeader).to.be(8);
    expect(p.bytesRcvd).to.be(0);
    expect(p.bytesPayload).to.be(0);
    expect(p.data).to.be(null);
    expect(p.extra).to.be(null);
    expect(p.rcvd).to.be(false);
    expect(p.buffers.length).to.be(0);
    expect(bufferEqual(p.header, HEADER)).to.be.ok();
  });

  it('append data byte by byte ok', function() {
    let p = new Parser();
    p.append(Buffer.from([0xf1]));
    expect(p.bytesRcvd).to.be(1);
    p.append(Buffer.from([0xf1]));
    expect(p.bytesRcvd).to.be(2);
    p.append(Buffer.from([0xf1]));
    expect(p.bytesRcvd).to.be(3);
    p.append(Buffer.from([0xf1]));
    expect(p.bytesRcvd).to.be(4);
    expect(p.bytesPayload).to.be(0);
    p.append(Buffer.from([0,0,0,8]));
    expect(p.bytesRcvd).to.be(8);
    expect(p.rcvd).to.be(false);
    expect(p.bytesPayload).to.be(8);
    p.append(Buffer.from([1,2,3,4]));
    expect(p.bytesRcvd).to.be(12);
    expect(p.rcvd).to.be(false);
    expect(p.bytesPayload).to.be(8);
    p.append(Buffer.from([5,6,7,8,9]));
    expect(p.bytesRcvd).to.be(17);
    expect(p.rcvd).to.be(true);
    expect(p.bytesPayload).to.be(8);
    expect(bufferEqual(p.data, Buffer.from([1,2,3,4,5,6,7,8]))).to.be.ok();
    expect(bufferEqual(p.extra, Buffer.from([9]))).to.be.ok();


  });


});

'use strict';
const expect = require('expect.js');
const bufferEqual = require('buffer-equal');
const Parser = require('../');

const HEADER = Buffer.from([0xf1, 0xf1, 0xf1, 0xf1]);

describe('basic function', function() {
  it('normal: new Parser with default parameter', function () {
    let p = new Parser();
    expect(p.bytesSync).to.be(4);
    expect(p.bytesHeader).to.be(8);
    expect(p.bytesRcvd).to.be(0);
    expect(p.bytesPayload).to.be(0);
    expect(p.data).to.be(null);
    expect(p.extra).to.be(null);
    expect(p.rcvd).to.be(false);
    expect(p.buffers.length).to.be(0);
    expect(bufferEqual(p.sync, HEADER)).to.be.ok();
  });


  it('normal: new Parser with specified sync and payload bytes', function () {
    let sync = Buffer.from([0x11, 0x22, 0x33]);
    let p = new Parser(sync, 2);
    expect(p.bytesSync).to.be(3);
    expect(p.bytesHeader).to.be(5);
    expect(p.bytesRcvd).to.be(0);
    expect(p.bytesPayload).to.be(0);
    expect(p.data).to.be(null);
    expect(p.extra).to.be(null);
    expect(p.rcvd).to.be(false);
    expect(p.buffers.length).to.be(0);
    expect(bufferEqual(p.sync, sync)).to.be.ok();
  });

  it('normal: new Parser with specified sync and payload bytes', function () {
    let sync = Buffer.from([0x11, 0x22, 0x33, 0x44, 0x55]);
    let p = new Parser(sync, 1);
    expect(p.bytesSync).to.be(sync.length);
    expect(p.bytesHeader).to.be(sync.length + 1);
    expect(p.bytesRcvd).to.be(0);
    expect(p.bytesPayload).to.be(0);
    expect(p.data).to.be(null);
    expect(p.extra).to.be(null);
    expect(p.rcvd).to.be(false);
    expect(p.buffers.length).to.be(0);
    expect(bufferEqual(p.sync, sync)).to.be.ok();
  });

  it('normal: new Parser with specified sync and default payload bytes', function () {
    let sync = Buffer.from([0x11, 0x22, 0x33, 0x44, 0x55]);
    let p = new Parser(sync);
    expect(p.bytesSync).to.be(sync.length);
    expect(p.bytesHeader).to.be(sync.length + 4);
    expect(p.bytesRcvd).to.be(0);
    expect(p.bytesPayload).to.be(0);
    expect(p.data).to.be(null);
    expect(p.extra).to.be(null);
    expect(p.rcvd).to.be(false);
    expect(p.buffers.length).to.be(0);
    expect(bufferEqual(p.sync, sync)).to.be.ok();
  });

  it('normal: new Parser with specified payload bytes and default sync', function () {
    let p = new Parser(2);
    expect(p.bytesSync).to.be(4);
    expect(p.bytesHeader).to.be(6);
    expect(p.bytesRcvd).to.be(0);
    expect(p.bytesPayload).to.be(0);
    expect(p.data).to.be(null);
    expect(p.extra).to.be(null);
    expect(p.rcvd).to.be(false);
    expect(p.buffers.length).to.be(0);
    expect(bufferEqual(p.sync, HEADER)).to.be.ok();
  });


  it('abnormal: new Parser with 1st para null', function () {
    try {
      new Parser(null, 3);
    } catch(e) {
      expect(e.message).to.be('Parameter should not be null.');
      return;
    }
  });

  it('abnormal: new Parser with 2nd para null', function () {
    try {
      new Parser(3, null);
    } catch(e) {
      expect(e.message).to.be('Parameter should not be null.');
      return;
    }
  });

  it('abnormal: new Parser with 1st para NaN', function () {
    try {
      new Parser(Number.parseInt({}), 3);
    } catch(e) {
      expect(e.message).to.be('Parameter should not be NaN.');
      return;
    }
  });

  it('abnormal: new Parser with 2nd para NaN', function () {
    try {
      new Parser(3, Number.parseInt({}));
    } catch(e) {
      expect(e.message).to.be('Parameter should not be NaN.');
      return;
    }
  });

  it('abnormal: new Parser with only 2nd para', function () {
    try {
      new Parser(undefined, 2);
    } catch(e) {
      expect(e.message).to.be('1st parameter should be provided.');
      return;
    }
  });

  it('abnormal: new Parser with none Buffer sync', function () {
    try {
      new Parser('123', 2);
    } catch(e) {
      expect(e.message).to.be('sync must be a Buffer');
      return;
    }
  });

  it('abnormal: new Parser with 0 byte sync', function () {
    try {
      new Parser(Buffer.from([]), 2);
    } catch(e) {
      expect(e.message).to.be('sync length should be greater than 0.');
      return;
    }
  });


  it('abnormal: new Parser with invalid bytes payload in byte at 1st para', function () {
    try {
      new Parser(3);
    } catch(e) {
      expect(e.message).to.be('sync must be a Buffer');
      return;
    }
  });

  it('abnormal: new Parser with invalid bytes payload in byte at 2nd para', function () {
    try {
      new Parser(Buffer.from([1,2,3]), 3);
    } catch(e) {
      expect(e.message).to.be('2nd parameter should be 1, 2, or 4.');
      return;
    }
  });

  it('append data for fixed package', function() {
    let sync = Buffer.from([0x57, 0x00, 0xff]);
    let p = new Parser(sync, 0);
    p.setFixLength(13);
    p.append(Buffer.from([0x57, 0x00, 0xff, 0x32, 0x11, 0x22, 0x33, 0x44]));
    p.append(Buffer.from([0xf1, 0x04, 0x00, 0x00, 0x06, 0x00, 0xff, 0xf1]));
    expect(p.rcvd).to.be.ok();
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

  it('append data byte by byte with specified sync', function() {
    let sync = Buffer.from([0x11, 0x22, 0x33, 0x44, 0x55]);
    let p = new Parser(sync);

    p.append(Buffer.from([0x11]));
    expect(p.bytesRcvd).to.be(1);
    p.append(Buffer.from([0x22]));
    expect(p.bytesRcvd).to.be(2);
    p.append(Buffer.from([0x33]));
    expect(p.bytesRcvd).to.be(3);
    p.append(Buffer.from([0x44]));
    expect(p.bytesRcvd).to.be(4);
    p.append(Buffer.from([0x55]));
    expect(p.bytesRcvd).to.be(5);

    expect(p.bytesPayload).to.be(0);
    p.append(Buffer.from([0,0,0,8]));
    expect(p.bytesRcvd).to.be(9);
    expect(p.rcvd).to.be(false);
    expect(p.bytesPayload).to.be(8);
    p.append(Buffer.from([1,2,3,4]));
    expect(p.bytesRcvd).to.be(13);
    expect(p.rcvd).to.be(false);
    expect(p.bytesPayload).to.be(8);
    p.append(Buffer.from([5,6,7,8,9]));
    expect(p.bytesRcvd).to.be(18);
    expect(p.rcvd).to.be(true);
    expect(p.bytesPayload).to.be(8);
    expect(bufferEqual(p.data, Buffer.from([1,2,3,4,5,6,7,8]))).to.be.ok();
    expect(bufferEqual(p.extra, Buffer.from([9]))).to.be.ok();
  });

  it('append data byte by byte with specified sync', function() {
    let sync = Buffer.from([0x11, 0x22, 0x33, 0x44, 0x55]);
    let p = new Parser(sync);
    p.append(Buffer.from([1, 2, 3, 0x11]));
    expect(p.bytesRcvd).to.be(4);
    p.append(Buffer.from([0x22, 0x33, 0x44, 0x55, 0, 0]));
    expect(p.bytesRcvd).to.be(10);
    expect(p.bytesPayload).to.be(0);
    p.append(Buffer.from([0,8]));
    expect(p.bytesRcvd).to.be(12);
    expect(p.rcvd).to.be(false);
    expect(p.bytesPayload).to.be(8);
    p.append(Buffer.from([1,2,3,4]));
    expect(p.bytesRcvd).to.be(16);
    expect(p.rcvd).to.be(false);
    expect(p.bytesPayload).to.be(8);
    p.append(Buffer.from([5,6,7,8,9]));
    expect(p.bytesRcvd).to.be(21);
    expect(p.rcvd).to.be(true);
    expect(p.bytesPayload).to.be(8);
    expect(bufferEqual(p.data, Buffer.from([1,2,3,4,5,6,7,8]))).to.be.ok();
    expect(bufferEqual(p.extra, Buffer.from([9]))).to.be.ok();
  });

  it('normal: append data with the one beginning byte of sync', function() {
    let sync = Buffer.from([0x11, 0x22, 0x33, 0x44, 0x55]);
    let p = new Parser(sync);
    p.append(Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 0x11]));
    expect(p.bytesRcvd).to.be(1);
    p.append(Buffer.from([0x22, 0x33, 0x44, 0x55, 0, 0]));
    expect(p.bytesRcvd).to.be(7);
    expect(p.bytesPayload).to.be(0);
    p.append(Buffer.from([0,8]));
    expect(p.bytesRcvd).to.be(9);
    expect(p.rcvd).to.be(false);
    expect(p.bytesPayload).to.be(8);
    p.append(Buffer.from([1,2,3,4]));
    expect(p.bytesRcvd).to.be(13);
    expect(p.rcvd).to.be(false);
    expect(p.bytesPayload).to.be(8);
    p.append(Buffer.from([5,6,7,8,9]));
    expect(p.bytesRcvd).to.be(18);
    expect(p.rcvd).to.be(true);
    expect(p.bytesPayload).to.be(8);
    expect(bufferEqual(p.data, Buffer.from([1,2,3,4,5,6,7,8]))).to.be.ok();
    expect(bufferEqual(p.extra, Buffer.from([9]))).to.be.ok();
  });

  it('normal: append data with the two beginning byte of sync', function() {
    let sync = Buffer.from([0x11, 0x22, 0x33, 0x44, 0x55]);
    let p = new Parser(sync);
    p.append(Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 0x11, 0x22]));
    expect(p.bytesRcvd).to.be(2);
    p.append(Buffer.from([0x33, 0x44, 0x55, 0, 0]));
    expect(p.bytesRcvd).to.be(7);
    expect(p.bytesPayload).to.be(0);
    p.append(Buffer.from([0,8]));
    expect(p.bytesRcvd).to.be(9);
    expect(p.rcvd).to.be(false);
    expect(p.bytesPayload).to.be(8);
    p.append(Buffer.from([1,2,3,4]));
    expect(p.bytesRcvd).to.be(13);
    expect(p.rcvd).to.be(false);
    expect(p.bytesPayload).to.be(8);
    p.append(Buffer.from([5,6,7,8,9]));
    expect(p.bytesRcvd).to.be(18);
    expect(p.rcvd).to.be(true);
    expect(p.bytesPayload).to.be(8);
    expect(bufferEqual(p.data, Buffer.from([1,2,3,4,5,6,7,8]))).to.be.ok();
    expect(bufferEqual(p.extra, Buffer.from([9]))).to.be.ok();
  });

  it('normal: append data with the three beginning byte of sync', function() {
    let sync = Buffer.from([0x11, 0x22, 0x33, 0x44, 0x55]);
    let p = new Parser(sync);
    p.append(Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 0x11, 0x22, 0x33]));
    expect(p.bytesRcvd).to.be(3);
    p.append(Buffer.from([0x44, 0x55, 0, 0]));
    expect(p.bytesRcvd).to.be(7);
    expect(p.bytesPayload).to.be(0);
    p.append(Buffer.from([0,8]));
    expect(p.bytesRcvd).to.be(9);
    expect(p.rcvd).to.be(false);
    expect(p.bytesPayload).to.be(8);
    p.append(Buffer.from([1,2,3,4]));
    expect(p.bytesRcvd).to.be(13);
    expect(p.rcvd).to.be(false);
    expect(p.bytesPayload).to.be(8);
    p.append(Buffer.from([5,6,7,8,9]));
    expect(p.bytesRcvd).to.be(18);
    expect(p.rcvd).to.be(true);
    expect(p.bytesPayload).to.be(8);
    expect(bufferEqual(p.data, Buffer.from([1,2,3,4,5,6,7,8]))).to.be.ok();
    expect(bufferEqual(p.extra, Buffer.from([9]))).to.be.ok();
  });

  it('normal: append data with the four beginning byte of sync', function() {
    let sync = Buffer.from([0x11, 0x22, 0x33, 0x44, 0x55]);
    let p = new Parser(sync);
    p.append(Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 0x11, 0x22, 0x33, 0x44]));
    expect(p.bytesRcvd).to.be(4);
    p.append(Buffer.from([0x55, 0, 0]));
    expect(p.bytesRcvd).to.be(7);
    expect(p.bytesPayload).to.be(0);
    p.append(Buffer.from([0,8]));
    expect(p.bytesRcvd).to.be(9);
    expect(p.rcvd).to.be(false);
    expect(p.bytesPayload).to.be(8);
    p.append(Buffer.from([1,2,3,4]));
    expect(p.bytesRcvd).to.be(13);
    expect(p.rcvd).to.be(false);
    expect(p.bytesPayload).to.be(8);
    p.append(Buffer.from([5,6,7,8,9]));
    expect(p.bytesRcvd).to.be(18);
    expect(p.rcvd).to.be(true);
    expect(p.bytesPayload).to.be(8);
    expect(bufferEqual(p.data, Buffer.from([1,2,3,4,5,6,7,8]))).to.be.ok();
    expect(bufferEqual(p.extra, Buffer.from([9]))).to.be.ok();
  });

  it('normal: append data with the whole', function() {
    let sync = Buffer.from([0x11, 0x22, 0x33, 0x44, 0x55]);
    let p = new Parser(sync);
    p.append(Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 0x11, 0x22, 0x33, 0x44, 0x55]));
    expect(p.bytesRcvd).to.be(14);
    p.append(Buffer.from([0, 0]));
    expect(p.bytesRcvd).to.be(16);
    expect(p.bytesPayload).to.be(0);
    p.append(Buffer.from([0,8]));
    expect(p.bytesRcvd).to.be(18);
    expect(p.rcvd).to.be(false);
    expect(p.bytesPayload).to.be(8);
    p.append(Buffer.from([1,2,3,4]));
    expect(p.bytesRcvd).to.be(22);
    expect(p.rcvd).to.be(false);
    expect(p.bytesPayload).to.be(8);
    p.append(Buffer.from([5,6,7,8,9]));
    expect(p.bytesRcvd).to.be(27);
    expect(p.rcvd).to.be(true);
    expect(p.bytesPayload).to.be(8);
    expect(bufferEqual(p.data, Buffer.from([1,2,3,4,5,6,7,8]))).to.be.ok();
    expect(bufferEqual(p.extra, Buffer.from([9]))).to.be.ok();
  });
});


describe('basic function for bytes payload in byte 2', function() {

  it('append data byte by byte with specified sync', function() {
    let sync = Buffer.from([0x11, 0x22, 0x33, 0x44, 0x55]);
    let p = new Parser(sync, 2);
    p.append(Buffer.from([0x11]));
    expect(p.bytesRcvd).to.be(1);
    p.append(Buffer.from([0x22]));
    expect(p.bytesRcvd).to.be(2);
    p.append(Buffer.from([0x33]));
    expect(p.bytesRcvd).to.be(3);
    p.append(Buffer.from([0x44]));
    expect(p.bytesRcvd).to.be(4);
    p.append(Buffer.from([0x55]));
    expect(p.bytesRcvd).to.be(5);

    expect(p.bytesPayload).to.be(0);
    p.append(Buffer.from([0,8]));
    expect(p.bytesRcvd).to.be(7);
    expect(p.rcvd).to.be(false);
    expect(p.bytesPayload).to.be(8);
    p.append(Buffer.from([1,2,3,4]));
    expect(p.bytesRcvd).to.be(11);
    expect(p.rcvd).to.be(false);
    expect(p.bytesPayload).to.be(8);
    p.append(Buffer.from([5,6,7,8,9]));
    expect(p.bytesRcvd).to.be(16);
    expect(p.rcvd).to.be(true);
    expect(p.bytesPayload).to.be(8);
    expect(bufferEqual(p.data, Buffer.from([1,2,3,4,5,6,7,8]))).to.be.ok();
    expect(bufferEqual(p.extra, Buffer.from([9]))).to.be.ok();
  });


});

describe('basic function for bytes payload in byte 1', function() {

  it('append data byte by byte with specified sync', function() {
    let sync = Buffer.from([0x11, 0x22, 0x33, 0x44, 0x55]);
    let p = new Parser(sync, 1);
    p.append(Buffer.from([0x11]));
    expect(p.bytesRcvd).to.be(1);
    p.append(Buffer.from([0x22]));
    expect(p.bytesRcvd).to.be(2);
    p.append(Buffer.from([0x33]));
    expect(p.bytesRcvd).to.be(3);
    p.append(Buffer.from([0x44]));
    expect(p.bytesRcvd).to.be(4);
    p.append(Buffer.from([0x55]));
    expect(p.bytesRcvd).to.be(5);

    expect(p.bytesPayload).to.be(0);
    p.append(Buffer.from([8]));
    expect(p.bytesRcvd).to.be(6);
    expect(p.rcvd).to.be(false);
    expect(p.bytesPayload).to.be(8);

    p.append('hello');
    expect(p.bytesRcvd).to.be(6);
    expect(p.rcvd).to.be(false);
    expect(p.bytesPayload).to.be(8);

    p.append(Buffer.from([1,2,3,4]));
    expect(p.bytesRcvd).to.be(10);
    expect(p.rcvd).to.be(false);
    expect(p.bytesPayload).to.be(8);
    p.append(Buffer.from([5,6,7,8,9]));
    expect(p.bytesRcvd).to.be(15);
    expect(p.rcvd).to.be(true);
    expect(p.bytesPayload).to.be(8);
    expect(bufferEqual(p.data, Buffer.from([1,2,3,4,5,6,7,8]))).to.be.ok();
    expect(bufferEqual(p.extra, Buffer.from([9]))).to.be.ok();

    p.clear();
    expect(p.bytesSync).to.be(sync.length);
    expect(p.bytesHeader).to.be(sync.length + 1);
    expect(p.bytesRcvd).to.be(0);
    expect(p.bytesPayload).to.be(0);
    expect(p.data).to.be(null);
    expect(p.extra).to.be(null);
    expect(p.rcvd).to.be(false);
    expect(p.buffers.length).to.be(0);
    expect(bufferEqual(p.sync, sync)).to.be.ok();

  });

});

describe('recv with timeout', function() {
  it('timeout', function(done) {
    let sync = Buffer.from([0x33, 0xcc, 0xcc, 0x33]);
    let p = new Parser(sync, 2);
    p.append(sync);
    p.append(Buffer.from([0, 15]));
    p.append(Buffer.alloc(15));
    expect(p.rcvd).to.be.ok();

    p.clear();
    p.setTimeout(5);

    p.append(sync);
    p.append(Buffer.from([0, 15]));

    setTimeout(function() {
      p.append(Buffer.from([0, 15]));
      p.append(Buffer.alloc(15));
      expect(p.rcvd).not.to.be.ok();
      done();
    }, 10);
  });

});

describe('recv with timeout', function() {
  it('timeout', function(done) {
    let sync = Buffer.from([0x33, 0xcc, 0xcc, 0x33]);
    let p = new Parser(sync, 2);
    p.append(sync);
    p.append(Buffer.from([0, 15]));
    p.append(Buffer.alloc(15));
    expect(p.rcvd).to.be.ok();

    p.clear();
    p.setTimeout(5);

    p.append(sync);
    p.append(Buffer.from([0, 15]));

    setTimeout(function() {
      p.append(Buffer.from([0, 15]));
      p.append(Buffer.alloc(15));
      expect(p.rcvd).not.to.be.ok();

      p.append(sync);
      p.append(Buffer.from([0, 15]));
      p.append(Buffer.alloc(15));
      expect(p.rcvd).to.be.ok();
      done();
    }, 10);
  });
});


describe('recv with timeout', function() {
  it('timeout', function(done) {
    let sync = Buffer.from([0x33, 0xcc, 0xcc, 0x33]);
    let p = new Parser(sync, 2);
    p.append(sync);
    p.append(Buffer.from([0, 15]));
    p.append(Buffer.alloc(15));
    expect(p.rcvd).to.be.ok();

    p.clear();
    try{
      p.setTimeout('5');
    } catch(e) {
      expect(e.message).to.be('timeout must be a number');
      done();
    }
  });
});


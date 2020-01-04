'use strict';

const kHeader = Buffer.from([0xf1, 0xf1, 0xf1, 0xf1]);
const kHeader1 = Buffer.from([0xf1]);
const kHeader2 = Buffer.from([0xf1, 0xf1]);
const kHeader3 = Buffer.from([0xf1, 0xf1, 0xf1]);

const kLengthLen = 4;

function Parser(header) {
  this.header = header || kHeader;
  this.kHeaderLen = this.header.length;
  this.kControlLen = this.kHeaderLen + kLengthLen;
  this.rcvdLen = 0;
  this.payloadLen = 0;
  this.rcvd = false;

  this.buffer = [];
  this.data = null;
  this.extra = null;
}

Parser.prototype.appendData = function(data) {
  if (!Buffer.isBuffer(data)) {
    return;
  }

  this.rcvdLen += data.length;
  this.buffer.push(data);

  // if less than kControlLen Bytes rcvd, keep in buffer and wait for next data
  if (this.rcvdLen < this.kControlLen) {
    return;
  }

  let buf = Buffer.concat(this.buffer);
  let headerIndex = buf.indexOf(kHeader);

  // if header not included, remove the annoying data
  if (headerIndex < 0) {
    this.buffer = [];
    this.rcvdLen = 0;

    if (!buf.subarray(-3).compare(kHeader3)) {
      this.buffer.push(kHeader3);
      this.rcvdLen = 3;
    } else if (!buf.subarray(-2).compare(kHeader2)) {
      this.buffer.push(kHeader2);
      this.rcvdLen = 2;
    } else if (!buf.subarray(-1).compare(kHeader1)) {
      this.buffer.push(kHeader1);
      this.rcvdLen = 1;
    }
    return;
  }

  // data length not rcvd
  if (this.rcvdLen - headerIndex - this.kHeaderLen < kLengthLen) {
    return;
  }

  this.payloadLen = buf.readUInt32BE(headerIndex + this.kHeaderLen);

  // wait for whole data
  if (this.payloadLen > this.rcvdLen - headerIndex - this.kControlLen) {
    return;
  }


  this.data = buf.subarray(headerIndex + this.kControlLen,
                           headerIndex + this.kControlLen + this.payloadLen);

  if (this.rcvdLen - headerIndex - this.kControlLen > this.payloadLen) {
    this.extra = buf.subarray(headerIndex + this.kControlLen + this.payloadLen);
  }

  this.rcvd = true;
}

Parser.prototype.reInit = function() {
  this.buffer = [];
  this.extra = [];
  this.rcvdLen = 0;
  this.rcvd = false;
  this.payloadLen = 0;
  this.data = null;
};

module.exports = Parser;

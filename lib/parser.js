'use strict';

const defaultSync = Buffer.from([0xf1, 0xf1, 0xf1, 0xf]);

const kHeader = Buffer.from([0xf1, 0xf1, 0xf1, 0xf1]);
const kHeader1 = Buffer.from([0xf1]);
const kHeader2 = Buffer.from([0xf1, 0xf1]);
const kHeader3 = Buffer.from([0xf1, 0xf1, 0xf1]);

const kLengthLen = 4;

function Parser(header) {
  this.header = header || kHeader;
  this.bytesSync = this.header.length;
  this.bytesHeader = this.bytesSync + kLengthLen;
  this.bytesRcvd = 0;
  this.bytesPayload = 0;
  this.rcvd = false;

  this.buffers = [];
  this.data = null;
  this.extra = null;
}

Parser.prototype.append = function(data) {
  if (!Buffer.isBuffer(data)) {
    return;
  }

  this.bytesRcvd += data.length;
  this.buffers.push(data);

  // if less than bytesHeader Bytes rcvd, keep in buffer and wait for next data
  if (this.bytesRcvd < this.bytesHeader) {
    return;
  }

  let buf = Buffer.concat(this.buffers);
  let headerIndex = buf.indexOf(kHeader);

  // if header not included, remove the annoying data
  if (headerIndex < 0) {
    this.buffers = [];
    this.bytesRcvd = 0;

    if (!buf.subarray(-3).compare(kHeader3)) {
      this.buffers.push(kHeader3);
      this.bytesRcvd = 3;
    } else if (!buf.subarray(-2).compare(kHeader2)) {
      this.buffers.push(kHeader2);
      this.bytesRcvd = 2;
    } else if (!buf.subarray(-1).compare(kHeader1)) {
      this.buffers.push(kHeader1);
      this.bytesRcvd = 1;
    }
    return;
  }

  // data length not rcvd
  if (this.bytesRcvd - headerIndex - this.bytesSync < kLengthLen) {
    return;
  }

  this.bytesPayload = buf.readUInt32BE(headerIndex + this.bytesSync);

  // wait for whole data
  if (this.bytesPayload > this.bytesRcvd - headerIndex - this.bytesHeader) {
    return;
  }


  this.data = buf.subarray(headerIndex + this.bytesHeader,
                           headerIndex + this.bytesHeader + this.bytesPayload);

  if (this.bytesRcvd - headerIndex - this.bytesHeader > this.bytesPayload) {
    this.extra = buf.subarray(headerIndex + this.bytesHeader + this.bytesPayload);
  }

  this.rcvd = true;
}

Parser.prototype.clear = function() {
  this.buffers = [];
  this.extra = [];
  this.bytesRcvd = 0;
  this.rcvd = false;
  this.bytesPayload = 0;
  this.data = null;
};

module.exports = Parser;

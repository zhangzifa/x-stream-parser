'use strict';

/*
sync bytes:      self defined bytes, default: 0xf1, 0xf1, 0xf1, 0xf1
payload length:  1, 2 or 4 bytes, default: 4 bytes
payload:
*/

const defaultSync = Buffer.from([0xf1, 0xf1, 0xf1, 0xf1]);
const bytesUint8 = 1;
const bytesUint16 = 2;
const bytesUint32 = 4;
const supportedBytes = [bytesUint8, bytesUint16, bytesUint32];

// if
function checkBytesPayloadInByte(x) {
  if (supportedBytes.includes(x)) {
    return x;
  }
  return false;
}

// if
function checkSync(s) {
  if (!Buffer.isBuffer(s)) {
    throw Error('sync must be a Buffer');
  }

  if (s.length === 0) {
    throw Error('sync length should be greater than 0.')
  }

  return true;
}

function Parser(sync, bytes_payload_in_byte) {
  if (sync === null || bytes_payload_in_byte === null) {
    throw Error('Parameter should not be null.');
  }

  if (Number.isNaN(sync) || Number.isNaN(bytes_payload_in_byte)) {
    throw Error('Parameter should not be NaN.');
  }

  if (sync === undefined && bytes_payload_in_byte === undefined) {
    this.sync = defaultSync;
    this.bytesPayloadInByte = bytesUint32;
  } else if (sync === undefined) {
    throw Error('1st parameter should be provided.');
  } else if ( bytes_payload_in_byte === undefined) {
    if (checkBytesPayloadInByte(sync)) {
      this.bytesPayloadInByte = sync;
      this.sync = defaultSync;
    } else if (checkSync(sync)) {
      this.bytesPayloadInByte = bytesUint32;
      this.sync = sync;
    }
  } else {
    if (checkBytesPayloadInByte(bytes_payload_in_byte)) {
      this.bytesPayloadInByte = bytes_payload_in_byte;
    } else {
      throw Error('2nd parameter should be 1, 2, or 4.');
    }
    if (checkSync(sync)) {
      this.sync = sync;
    }
  }

  this.bytesSync = this.sync.length;
  this.bytesHeader = this.bytesSync + this.bytesPayloadInByte;
  this.bytesRcvd = 0;
  this.bytesPayload = 0;
  this.rcvd = false;

  this.buffers = [];
  this.data = null;
  this.extra = null;
  this.timer = null;
  this.timeout = null;
}

Parser.prototype.clear = function() {
  this.buffers = [];
  this.extra = null;
  this.bytesRcvd = 0;
  this.rcvd = false;
  this.bytesPayload = 0;
  this.data = null;
};

Parser.prototype.append = function(data) {
  var self = this;
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
  let headerIndex = buf.indexOf(this.sync);

  // if header not included, remove the annoying data
  if (headerIndex < 0) {
    this.buffers = [];
    this.bytesRcvd = 0;

    for (let i = 1; i < this.bytesSync; i++) {
      // the first (this.bytesSync - i) bytes of sync
      let cmp = this.sync.subarray(0, this.bytesSync - i);
      let partSyncRcvd = buf.subarray(i - this.bytesSync);

      if (partSyncRcvd.compare(cmp) === 0) {
        this.bytesRcvd = this.bytesSync - i;
        this.buffers.push(cmp);
        break;
      }
    }
    return;
  }
  // when sync rcvd, setTimeout
  if (this.timeout !== null && !this.timer) {
    this.timer = setTimeout(function() {
      self.clear();
      this.timer = null;
    }, this.timeout);
  }

  // data length not rcvd
  if (this.bytesRcvd - headerIndex - this.bytesSync < this.bytesPayloadInByte) {
    return;
  }

  if (this.bytesPayloadInByte === bytesUint32) {
    this.bytesPayload = buf.readUInt32BE(headerIndex + this.bytesSync);
  } else if (this.bytesPayloadInByte === bytesUint16) {
    this.bytesPayload = buf.readUInt16BE(headerIndex + this.bytesSync);
  } else {
    this.bytesPayload = buf.readUInt8(headerIndex + this.bytesSync);
  }

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

Parser.prototype.setTimeout = function(ms) {
  if (typeof ms !== 'number') {
    throw Error('timeout must be a number');
  }
  this.timeout = ms;
}

module.exports = Parser;

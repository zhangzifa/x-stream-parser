# x-stream-parser

In embedded world, there is a lot communication between devices and servers, or between devices and devices.

Ether via TCP or UART or something else, the data is in stream mode and the receiver must have the ability to parse the data received.

The following protocol is widely used:

```c
// sync + how-many-bytes-the-payload-included + payload.
// The payload can be in any format.

0xf1, 0xcc, 0x33, 0xee, [length], [payload with length bytes]

```


This parser provided a method to parse data from stream.


# usage

## installation

```bash
npm i x-stream-parser --save
```

## how-to-use-without-timeout

```js
var Parser = require('x-stream-parser');

// sync: self defined sync, must be a buffer
// bytes_payload_in_byte: 1, 2, or 4. how many bytes to record payload length
// by defaut, sync is 0xf1, 0xf1, 0xf1, 0xf1
//            bytes_payload_in_byte is 4
// which means a normal package is:
//            ---sync---------------  ---0x00000004---------  ---payload--
//            0xf1, 0xf1, 0xf1, 0xf1, 0x00, 0x00, 0x00, 0x04, 1, 2, 3, 4

// init a parser
var parser = new Parser(sync, bytes_payload_in_byte);

// append data to parser normally in a async function
// d must be a buffer
rcvdData(function(d) {
  parser.append(d);

  // when a whole package rcvd, parser.rcvd is set TRUE
  if (parser.rcvd) {

    // the payload will be in parser.data in Buffer format
    dataHandler(parser.data);

    // THIS IS A MUST after data handling.
    // otherwise, data will not be cleared from the parser.
    parser.clear();
  }
});

```

## how-to-use-with-timeout

In the real world, timeout is needed as there is always something you don't expect to happend, such as one byte is lost during transfer.

So a timeout mechanism is needed.

When the sync and bytes-paylaod-in-byte is rcvd, if timeout is set, a timer starts.

If the whole package is not rcvd within timeout, the rcvd data will be dropped.

```js
var parser = new Parser(sync, bytes_payload_in_byte);

// 100ms timeout for recv a whole package.
parser.setTimeout(100);

rcvdData(function(d) {
  parser.append(d);

  // when a whole package rcvd, parser.rcvd is set TRUE
  if (parser.rcvd) {

    // the payload will be in parser.data in Buffer format
    dataHandler(parser.data);

    // THIS IS A MUST after data handling.
    // otherwise, data will not be cleared from the parser.
    parser.clear();
  }
});
````

# License

The x-stream-parser is released under the MIT license.

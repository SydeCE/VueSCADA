var nodepccc = require("nodepccc");
var conn = new nodepccc();

conn.initiateConnection(
  { port: 44818, host: "172.29.10.111" /* , routing: [0x01,0x00,0x01,0x00] */ },
  connected
);
// Either uncomment the routing or uncomment this next line for ControlLogix/CompactLogix or if otherwise using routing
// First 0x01, 0x00 = 1 word in the path, second 0x01, 0x00 = Port 0x01 (backplane port of Ethernet module), 0x00 = PLC is in slot 0 in chassis.

setInterval(function() {
  conn.readAllItems(valuesReady);
}, 500);

function connected(err) {
  if (typeof err !== "undefined") {
    // We have an error.  Maybe the PLC is not reachable.
    console.log(err);
    process.exit();
  }
  conn.setTranslationCB(tagLookup);
  conn.addItems(["TEST1", "TEST2"]);
  conn.addItems("TEST3");
  //	conn.removeItems(['TEST2', 'TEST3']);  // Demo of "removeItems".
  //	conn.writeItems(['TEST5', 'TEST6'], [ 867.5309, 9 ], valuesWritten);  // You can write an array of items like this if you want.
  conn.writeItems("TEST2", 444, valuesWritten); // You can write a single array item too.
  conn.readAllItems(valuesReady);
}

function valuesReady(anythingBad, values) {
  if (anythingBad) {
    console.log("SOMETHING WENT WRONG READING VALUES!!!!");
  }
  console.log(values);
  // alternative syntax		console.log("Value is " + conn.findItem('TEST1').value + " quality is " + conn.findItem('TEST1').quality);
  //if (doneWriting) { process.exit(); }
}

function valuesWritten(anythingBad) {
  if (anythingBad) {
    console.log("SOMETHING WENT WRONG WRITING VALUES!!!!");
  }
  console.log("Done writing.");
  //if (doneReading) { process.exit(); }
}

// This is a very simple "tag lookup" callback function that would eventually be replaced with either a database findOne(), or a large array in memory.
// Note that the return value is a controller absolute address and datatype specifier.
// If you want to use absolute addresses only, you can do that too.
function tagLookup(tag) {
  switch (tag) {
    case "TEST1":
      return "N7:0"; // Integer
    case "TEST2":
      return "N7:40"; // Same as B3:1/1
    case "TEST3":
      return "B28:0/0"; // Bit
    case "TEST4":
      return "B28:1/1"; // Same as B3:1/1
    default:
      return undefined;
  }
}

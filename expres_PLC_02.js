const cors = require("cors");
const express = require("express");
const app = express();
const nodepccc = require("nodepccc");
const bodyParser = require("body-parser");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const conn = new nodepccc();

const port = 4000;
const delkaIntervalu = 1000; //milisec

// Příprava seznamu vyčítaných tagů
var poleTagu = [
  "N7:0",
  "N7:40",
  "O0:4/12",
  "I1:0/7",
  "I1:4",
  "I1:0/0",
  "I1:0/1",
  "I1:0/2",
  "I1:0/3",
  "I1:0/4",
  "I1:0/5",
  "I1:0/6",
  "I1:0/7",
  "I1:0/8",
  "I1:0/9",
  "I1:0/10",
  "I1:0/11",
  "I1:0/12",
  "I1:0/13",
  "I1:0/14",
  "I1:0/15"
];
//   "I1:1/0",
//   "I1:1/1",
//   "I1:1/2",
//   "I1:1/3",
//   "I1:1/4",
//   "I1:1/5",
//   "I1:1/6",
//   "I1:1/7",
//   "I1:1/8",
//   "I1:1/9",
//   "I1:1/10",
//   "I1:1/11",
//   "I1:1/12",
//   "I1:1/13",
//   "I1:1/14",
//   "I1:1/15",

//   "I1:2/0",
//   "I1:2/1",
//   "I1:2/2",
//   "I1:2/3",
//   "I1:2/4",
//   "I1:2/5",
//   "I1:2/6",
//   "I1:2/7",
//   "I1:2/8",
//   "I1:2/9",
//   "I1:2/10",
//   "I1:2/11",
//   "I1:2/12",
//   "I1:2/13",
//   "I1:2/14",
//   "I1:2/15",

//   "B3:1/0",
//   "B3:1/2",
//   "B3:1/4",
//   "B3:1/7",
//   "B3:1/8",
//   "B3:1/9",
//   "B3:1/10"
// ];
var poleHodnotPLC = [];
var connectionEstablished = false;

// Vytvoření trvalého connection na PLC
conn.initiateConnection({ port: 44818, host: "172.29.10.111" }, connected);

function connected(err) {
  if (!err) {
    console.log("Spojení s PLC úspěšně navázáno ...");
    conn.addItems(poleTagu);
    connectionEstablished = true;
  } else {
    console.log("Chyba spojení s PLC ...");
    connectionEstablished = false;
  }
}

// Periodické dotazování na stav tagů PLC
setInterval(function() {
  conn.readAllItems(VysledekCteni);
}, delkaIntervalu);

// Načtení kompletního pole tagů do proměnné pole
function VysledekCteni(err, valuesReady) {
  if (!err && connectionEstablished) {
    //console.log("Jsme ve výsledku funkce readAllItems ...");
    //console.table(valuesReady);
    // var zobraz = '{' + registr + ' : ' + valuesReady[registr] + '}'
    var poleVysledku = [];
    for (var i = 0; i < poleTagu.length; i++) {
      var objektTagu = {};
      var aktualniTag = poleTagu[i];
      objektTagu[aktualniTag] = valuesReady[aktualniTag];
      poleVysledku.push(objektTagu);
    }
    poleHodnotPLC = poleVysledku;
    console.log(valuesReady);
    //callback(err, poleVysledku);
  } else {
    poleHodnotPLC = [];
    console.log("Nastala chyba při vyčítání z PLC ...");
    //callback(true, err);
  }
}

function vratJedenTag(req, res) {
  var registr = req.params.tag;
  var pole = [];
  var objekt = {};

  if (!connectionEstablished) {
    conn.addItems();
    conn.readAllItems((err, valuesReady) => {
      if (!err) {
        //console.log("Jsme ve výsledku funkce readAllItems ...");
        //console.log("Vysledny text: " + valuesReady[registr]);
        objekt.tag = valuesReady[registr];
        pole.push(objekt);
        res.send(pole);
        conn.dropConnection(vysledek => {
          console.log("Výsledek ukončení spojení na PLC: ", vysledek);
        });
      }
    });
  } else {
    for (var i = 0; i < poleTagu.length; i++) {
      if (poleTagu[i] === registr) {
        objekt = poleHodnotPLC[i];
        pole.push(objekt);
        break;
      }
    }
    res.send(pole);
  }
}

app.get("/api/plc", (req, res) => res.send(poleHodnotPLC));
app.get("/api/plc/:tag", vratJedenTag);

//format:
//  axios.post('/user',)

app.post("/api/plc/zapis", (req, res) => {
  console.log("Výsledek req: ", req.body);
  var tagName = req.body[0];
  var tagValue = parseInt(req.body[1]);
  console.log("tagName: ", tagName);
  console.log("tagValue: ", tagValue);
  conn.writeItems(tagName, tagValue, valuesWritten => {
    console.log("valueWritten: ", valuesWritten);
    res.send(valuesWritten);
  });
});

// ------- PLC ---------------

app.listen(port, () => console.info(`Server is listening on ${port}.`));

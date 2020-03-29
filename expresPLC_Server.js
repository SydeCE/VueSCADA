const express = require("express");
const nodepccc = require("nodepccc");
const cors = require("cors");
const bodyParser = require("body-parser");

// EXPRESS modul je framework pro POST API
// NODEPCCC modul zprostředkovává komunikaci s PLC
// CORS modul řeší CORS chybu browseru při volání serveru z jiného serveru
// BODY-PARSER umožňuje předávání parametrů při POST requestech

const app = express();
const conn = new nodepccc();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// VSTUPNÍ PARAMETRY SERVERU
const ipAddressPLC = "172.29.10.111";
const portPLC = 44818;

const portServer = 4000;
const delkaIntervalu = 1000; // perioda vyčítání hodnot z PLC [milisec]

var poleHodnotPLC = []; // Posledně načtených hodnoty PLC - odkud je načítá GET
var connectionEstablished = false;
var objektJSON = {};

// Pole vyčítaných tagů z PLC
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
  "I1:0/15",
  "I1:1/0",
  "I1:1/1",
  "I1:1/2",
  "I1:1/3",
  "I1:1/4",
  "I1:1/5",
  "I1:1/6",
  "I1:1/7",
  "I1:1/8",
  "I1:1/9",
  "I1:1/10",
  "I1:1/11",
  "I1:1/12",
  "I1:1/13",
  "I1:1/14",
  "I1:1/15",

  "I1:2/0",
  "I1:2/1",
  "I1:2/2",
  "I1:2/3",
  "I1:2/4",
  "I1:2/5",
  "I1:2/6",
  "I1:2/7",
  "I1:2/8",
  "I1:2/9",
  "I1:2/10",
  "I1:2/11",
  "I1:2/12",
  "I1:2/13",
  "I1:2/14",
  "I1:2/15",

  "B3:1/0",
  "B3:1/2",
  "B3:1/4",
  "B3:1/7",
  "B3:1/8",
  "B3:1/9",
  "B3:1/10"
];

// -----------------------------------------------------------------------------
// --------------------- V Ý K O N N Ý   K Ó D ---------------------------------
// -----------------------------------------------------------------------------

// --- HLAVNÍ SMYČKA -> Periodické dotazování na stav tagů PLC

setInterval(function() {
  if (!connectionEstablished) {
    // Vytvoření trvalého connection na PLC
    conn.initiateConnection({ port: portPLC, host: ipAddressPLC }, connected);
  } else {
    conn.readAllItems(HodnotyPLC);
  }
}, delkaIntervalu);

// volaný callback ze smyčky pro navázání spojení v případě jeho rozpadu
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

// Načtení kompletního pole tagů do proměnné pole
function HodnotyPLC(err, valuesReady) {
  if (!err && connectionEstablished) {
    var poleVysledku = [];
    for (var i = 0; i < poleTagu.length; i++) {
      var objektTagu = {};
      objektTagu.id = i;
      objektTagu.name = poleTagu[i];
      objektTagu.value = valuesReady[objektTagu.name];
      poleVysledku.push(objektTagu);
    }
    poleHodnotPLC = poleVysledku;
    console.log(poleHodnotPLC);
  } else {
    poleHodnotPLC = [];
    console.log("Nastala chyba při vyčítání z PLC ...");
  }
}

// Vrácení jednoho přednačteného parameteru
function VratJedenTag(req, res) {
  var registr = req.params.tag;
  registr = registr.replace("_", "/");
  var pole = [];
  var objekt = {};
  for (var i = 0; i < poleTagu.length; i++) {
    if (poleTagu[i] === registr) {
      objekt = poleHodnotPLC[i];
      pole.push(objekt);
      break;
    }
  }
  console.log("Odeslání jednoho TAGu: ", pole);
  res.send(pole);
}

function ZapisJedenTag(req, res) {
  //console.log("Výsledek req: ", req.body);
  var tagName = req.body.name;
  var tagValue = parseInt(req.body.value);
  conn.writeItems(tagName, tagValue, chybaZapisu => {
    if (!chybaZapisu) {
      var zmenaBarvyNaRed = "\x1b[31m";
      console.log(
        "Successfully written:",
        zmenaBarvyNaRed,
        tagName + " -> " + tagValue
      );
      res.send("Ok");
    } else {
      console.log("chybaZapisu: ", chybaZapisu);
    }
  });
}

//

function OdpovedGET(req, res) {
  objektJSON.ipAddressPLC = ipAddressPLC;
  objektJSON.time = new Date();
  objektJSON.values = poleHodnotPLC;
  objektJSON.reqBody = req.body;
  res.send(objektJSON);
}

// ------------------------------
// Čekání na dotazy z klientů ...
// ------------------------------

//app.get("/api/plc", (req, res) => res.send(poleHodnotPLC));
//app.get("/api/plc", VyctiVsePLC);
app.get("/api/plc", OdpovedGET);
app.get("/api/plc/:tag", VratJedenTag);
app.post("/api/plc/zapis", ZapisJedenTag);

// ------------------------------
// Spuštění express serveru
// ------------------------------
app.listen(portServer, () =>
  console.info(`Server is listening on ${portServer}.`)
);

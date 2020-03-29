const cors = require("cors");
const express = require("express");
const app = express();
const nodepccc = require("nodepccc");

app.use(cors());
const conn = new nodepccc();

const port = 4000;

// Příprava seznamu vyčítaných tagů
var poleTagu = ["N7:0", "N7:40", "B28:0/0", "B28:1/0"];
var poleHodnotPLC = [];
var connectionEstablished = false;

// Spuštění smyčky která v intervalech vyčítá data z PLC
setInterval(function() {
  conn.initiateConnection(
    { port: 44818, host: "172.29.10.111" },
    nactiPole(poleTagu, (err, vysl) => {
      if (err) {
        console.log("Chyba při vyčítání dat z PLC ...");
        connectionEstablished = false;
      } else {
        //console.log("Data načtena správně");
        poleHodnotPLC = vysl;
        connectionEstablished = true;
      }
    })
  );
}, 1000);

// Vyčtení jednoho tagu
// Je-li aktuální connection na PLC, vrátí pouze již načtenou hodnotu
// Není-li aktivní spojení - naváže jej

app.get("/api/plc/:tag", (req, res) => {
  //console.log("Nepřišla chyba z nazavzování spojení -> pokračujeme ...");
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
});

// Načtení kompletního pole tagů do proměnné pole
function nactiPole(pole, callback) {
  var poleVysledku = [];
  //console.log("Nepřišla chyba z nazavzování spojení -> pokračujeme ...");
  conn.addItems(pole);
  conn.readAllItems((err, valuesReady) => {
    if (!err) {
      //console.log("Jsme ve výsledku funkce readAllItems ...");
      console.table(valuesReady);
      // var zobraz = '{' + registr + ' : ' + valuesReady[registr] + '}'
      for (var i = 0; i < pole.length; i++) {
        var objektTagu = {};
        var aktualniTag = pole[i];
        objektTagu[aktualniTag] = valuesReady[aktualniTag];
        poleVysledku.push(objektTagu);
      }
      callback(err, poleVysledku);
    } else {
      callback(true, err);
    }
  });
}

app.get("/api/plc", (req, res) => res.send(poleHodnotPLC));

app.post("/api/plc/zapis", "N7:40", "123", (req, res) =>
  res.send("HTTP POST in action!")
);

// ------- PLC ---------------

app.listen(port, () => console.info(`Server is listening on ${port}.`));

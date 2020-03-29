<template>
  <div>
    <h1>Stránka PLC</h1>

    <button @click="nactiN7">Aktualizuj Tag</button>
    <p class="tagy">N7:0 --> {{ tagN7_0 }}</p>

    <form @submit.prevent="zapisTag"></form>
    <label>Hodnota N7:40</label>
    <input
      class="vstup"
      v-model="k_zapsani_N7_40"
      type="number"
      placeholder="Zadej požadovanou hodnotu N7:40"
    />

    <button @click="zapisTag">Zapiš Tag</button>
    <br />
    <button @click="nactiPLC">Aktualizuj PLC Tagy</button>
    <div class="box-s-textem">
      <p class="tagy" v-for="tag in poleTagu" :key="tag[0]">
        {{ Object.keys(tag)[0] }} = {{ tag[Object.keys(tag)[0]] }}
      </p>
    </div>
    <p>{{ timer }}</p>
  </div>
</template>

<script>
import MicroLogix from "@/services/MicroLogix.js";

export default {
  data() {
    return {
      tagN7_0: 222,
      nazevTagu: "N7:40",
      k_zapsani_N7_40: 0,
      tagN7_40: 0,
      poleTagu: [],
      timer: ""
    };
  },
  methods: {
    nactiN7() {
      //console.log("Před voláním MicroLogix service");
      MicroLogix.nactiTag("/api/plc/N7:0")
        .then(vysledek => {
          var klic = Object.keys(vysledek.data[0]);
          //console.log("Návrat s výsledkem: ", klic);
          console.table(vysledek.data);
          //var tag = "N7:0";
          //console.log(vysledek.data[0][klic]);
          this.tagN7_0 = vysledek.data[0][klic];
        })
        .catch(error => {
          console.log("Chyba při vyčítání PLC: ", error);
        });
    },
    nactiPLC: function() {
      MicroLogix.nactiTag("/api/plc")
        .then(vysledek => {
          //console.log("Návrat s výsledkem: ", klic);
          //console.table(vysledek.data);
          //var tag = "N7:0";
          //console.log(vysledek.data[0][klic]);
          this.poleTagu = vysledek.data;
        })
        .catch(error => {
          console.log("Chyba při vyčítání PLC: ", error);
        });
    },
    zapisTag: function() {
      var pole = [];
      pole.push("N7:40");
      pole.push(this.k_zapsani_N7_40);
      MicroLogix.zapisTag("/api/plc/zapis", pole)
        .then(vysledek => {
          //console.log("Návrat s výsledkem: ", klic);
          //console.table(vysledek.data);
          //var tag = "N7:0";
          //console.log(vysledek.data[0][klic]);
          console.log(vysledek);
          this.poleTagu = vysledek.data;
        })
        .catch(error => {
          console.log("Chyba při vyčítání PLC: ", error);
        });
    }
  },
  created() {
    this.nactiPLC();
    this.timer = setInterval(this.nactiPLC, 100);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  }
};
</script>

<style>
.tagy {
  font-family: "Helvetica";
  font-size: 12px;
  justify-content: left;
  margin: 0px;
  padding: 0px;
  text-align: "=";
}

.box-s-textem {
  margin: 10px;
}

.vstup {
  font-size: 14px;
  color: red;
  font-weight: bold;
}
</style>

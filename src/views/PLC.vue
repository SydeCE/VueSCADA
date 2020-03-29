<template>
  <div>
    <h1>Stránka PLC - SCADA test</h1>

    <button @click="vyctiTag">Načti Tag {{ nazevTagu }}</button>
    <p class="tagy">{{ nazevTagu }} : {{ hodnotaTagu }}</p>

    <form @submit.prevent="zapisTag"></form>
    <label>Hodnota {{ nazevTagu }} </label>
    <input
      class="vstup"
      v-model="hodnota_k_zapsani"
      type="number"
      placeholder="Zadej požadovanou hodnotu N7:40"
    />

    <button @click="zapisTag">Zapiš Tag</button>
    <br />
    <button @click="nactiPLC">Aktualizuj PLC Tagy</button>
    <div class="box-s-textem">
      <p class="tagy" v-for="tag in poleTagu" :key="tag.id">
        {{ tag.name }} = {{ tag.value }}
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
      cestaApi: "/api/plc/",
      nazevTagu: "N7:40",
      hodnotaTagu: 0,
      hodnota_k_zapsani: 0,
      poleTagu: [],
      timer: "",
      periodaVycitani: 300 // minimum je 200 ms
    };
  },
  methods: {
    nactiPLC: function() {
      MicroLogix.nactiPLC("/api/plc")
        .then(vysledek => {
          this.poleTagu = vysledek.data.values;
          console.log("vysledek.data: ", vysledek);
        })
        .catch(error => {
          console.log("Chyba při vyčítání PLC: ", error);
        });
    },
    zapisTag: function() {
      var objektZapisu = {};
      objektZapisu.name = this.nazevTagu;
      objektZapisu.value = this.hodnota_k_zapsani;
      MicroLogix.zapisTag("/api/plc/zapis", objektZapisu)
        .then(vysledek => {
          console.log(vysledek);
          this.poleTagu = vysledek.data;
        })
        .catch(error => {
          console.log("Chyba při vyčítání PLC: ", error);
        });
    },
    vyctiTag: function() {
      console.log("Vstup do vyctiTag");
      for (var i = 0; i < this.poleTagu.length; i++) {
        if (this.poleTagu[i].name === this.nazevTagu) {
          console.log("this.poleTagu[i].value: ", this.poleTagu[i].value);
          console.log("this.nazevTagu: ", this.nazevTagu);
          this.hodnotaTagu = this.poleTagu[i].value;
          return 23;
        }
      }
    }
  },
  computed: {},
  created() {
    this.nactiPLC();
    this.timer = setInterval(this.nactiPLC, this.periodaVycitani);
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

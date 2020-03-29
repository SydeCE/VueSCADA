import axios from "axios";

const apiClient = axios.create({
  baseURL: `http://172.29.10.33:4000`,
  withCredentials: false, // This is the default
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

export default {
  nactiTag(cesta) {
    //console.log("Volán GET s parametrem cesta: ", cesta);
    return apiClient.get(cesta);
  },
  zapisTag(cesta, hodnota) {
    console.log("Volán POST s parametrem hodnota: ", hodnota);
    return apiClient.post(cesta, hodnota);
  }
};

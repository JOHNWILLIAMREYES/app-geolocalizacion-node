const fs = require('fs');
const axios = require('axios');
class Busquedas {
  historial = [];
  dbPath = './db/database.json';

  constructor() {
    this.leerDB();
  }
  get historialCapitalizado() {
    return this.historial.map((lugar) => {
      let palabras = lugar.split(' ');
      palabras = palabras.map((p) => p[0].toUpperCase() + p.substring(1));
      return palabras.join(' ');
    });
  }
  get paramsMapbox() {
    return {
      access_token: process.env.MAPBOX_KEY || '',
      limit: 5,
      language: 'es',
    };
  }
  get paramsWeather() {
    return {
      appid: process.env.OPENWEATHER_KEY || '',
      units: 'metric',
      lang: 'es',
    };
  }

  async ciudad(lugar = '') {
    //petición http
    try {
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.paramsMapbox,
      });
      const {
        data: { features },
      } = await instance.get();
      return features.map((lugar) => ({
        id: lugar.id,
        nombre: lugar.place_name,
        longitud: lugar.center[0],
        latitud: lugar.center[1],
      }));
    } catch (error) {
      return [];
    }
  }
  async climaLugar(lat, lon) {
    try {
      //instance axios.create()
      const instance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: { ...this.paramsWeather, lat, lon },
      });
      // respuesta => data
      const {
        data: {
          weather,
          main: { temp_min, temp_max, temp },
        },
      } = await instance.get();
      //retornar objeto con {description, min, max,temp}
      return { description: weather[0].description, temp_min, temp_max, temp };
    } catch (error) {
      console.log(error);
    }
  }
  agregarHistorial(lugar = '') {
    if (this.historial.includes(lugar.toLocaleLowerCase())) {
      return;
    }
    this.historial = this.historial.splice(0, 5);
    this.historial.unshift(lugar.toLocaleLowerCase());
    this.guardarDB();
  }
  guardarDB() {
    const payload = {
      historial: this.historial,
    };
    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }
  leerDB() {
    if (!fs.existsSync(this.dbPath)) {
      return;
    }
    const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8' });
    const data = JSON.parse(info);
    this.historial = data.historial;
  }
}

module.exports = Busquedas;

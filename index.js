require('dotenv').config();
const { leerInput, inquirerMenu, pausa, listadoLugares } = require('./helpers/inquirer');
const Busquedas = require('./models/busquedas');

const main = async () => {
  const busquedas = new Busquedas();
  let opt = '';
  do {
    opt = await inquirerMenu();
    switch (opt) {
      case 1:
        // Mostrar mensaje para reibir el nombre de la ciudad
        const termino = await leerInput('Ciudad: ');
        //buscar los lugares
        const lugares = await busquedas.ciudad(termino);
        //seleccionar el lugar
        const id = await listadoLugares(lugares);
        if (id === '0') continue;
        const { nombre, latitud, longitud } = lugares.find((l) => l.id === id);
        busquedas.agregarHistorial(nombre);
        //clima de la ciudad
        const { description, temp_min, temp_max, temp } = await busquedas.climaLugar(
          latitud,
          longitud
        );
        //mostrar resultados
        console.log('\n Información del lugar\n'.green);
        console.log('ciudad:', nombre.green);
        console.log('Latitud:', latitud);
        console.log('Longitud: ', longitud);
        console.log('Temperatura: ', temp);
        console.log('Mínima: ', temp_min);
        console.log('Máxima: ', temp_max);
        console.log('Cómo está el clima: ', description.red);
        break;
      case 2:
        busquedas.historialCapitalizado.forEach((lugar, i) => {
          const idx = `${i + 1}.`.green;
          console.log(`${idx} ${lugar}`);
        });
        break;
    }
    // guardarDb(tareas.listadoArray);
    await pausa();
  } while (opt !== 0);
};
main();

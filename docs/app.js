

function generarInputs() {
    const numVariables = parseInt(document.getElementById('numVariables').value);
    let funcionObjetivoHTML = '<h3>Función Objetivo</h3>';
    let restriccionesHTML = '<h3>Restricciones</h3>';

    for (let i = 1; i <= numVariables; i++) {
        funcionObjetivoHTML += `
            <label for="fo${i}">Coeficiente x${i}:</label>
            <input type="number" id="fo${i}" step="any" required>
        `;
    }

    for (let i = 1; i <= numVariables; i++) {
        restriccionesHTML += `<h4>Restricción ${i}</h4>`;
        for (let j = 1; j <= numVariables; j++) {
            restriccionesHTML += `
                <label for="r${i}_${j}">Coeficiente x${j}:</label>
                <input type="number" id="r${i}_${j}" step="any" required>
            `;
        }// Función para generar dinámicamente los campos de entrada para los coeficientes y constantes de un problema de programación lineal
        function generarInputs() {
            // Obtener el número de variables del campo de entrada con el ID 'numVariables'
            const numVariables = parseInt(document.getElementById('numVariables').value);

            // Inicializar variables para almacenar el código HTML para la función objetivo y las restricciones
            let funcionObjetivoHTML = '<h3>Función Objetivo</h3>';
            let restriccionesHTML = '<h3>Restricciones</h3>';

            // Generar código HTML para los coeficientes de la función objetivo
            for (let i = 1; i <= numVariables; i++) {
                funcionObjetivoHTML += `
                    <label for="fo${i}">Coeficiente x${i}:</label>
                    <input type="number" id="fo${i}" step="any" required>
                `;
            }

            // Generar código HTML para las restricciones
            for (let i = 1; i <= numVariables; i++) {
                restriccionesHTML += `<h4>Restricción ${i}</h4>`;
                for (let j = 1; j <= numVariables; j++) {
                    restriccionesHTML += `
                        <label for="r${i}_${j}">Coeficiente x${j}:</label>
                        <input type="number" id="r${i}_${j}" step="any" required>
                    `;
                }
                restriccionesHTML += `
                    <label for="b${i}">Término independiente:</label>
                    <input type="number" id="b${i}" step="any" required>
                `;
            }

            // Establecer el HTML interno de los elementos div con IDs 'funcionObjetivo' y 'restricciones'
            document.getElementById('funcionObjetivo').innerHTML = funcionObjetivoHTML;
            document.getElementById('restricciones').innerHTML = restriccionesHTML;
        }

        // Función para resolver un problema de programación lineal utilizando el método Simplex
        function resolverSimplex() {
            // Obtener el número de variables y el tipo de problema
            const numVariables = parseInt(document.getElementById('numVariables').value);
            const tipoProblema = document.getElementById('tipoProblema').value;

            // Obtener los coeficientes de la función objetivo
            const funcionObjetivo = [];
            for (let i = 1; i <= numVariables; i++) {
                funcionObjetivo.push(parseFloat(document.getElementById(`fo${i}`).value));
            }

            // Obtener los coeficientes y términos independientes de las restricciones
            const restricciones = [];
            for (let i = 1; i <= numVariables; i++) {
                const restriccion = [];
                for (let j = 1; j <= numVariables; j++) {
                    restriccion.push(parseFloat(document.getElementById(`r${i}_${j}`).value));
                }
                restriccion.push(parseFloat(document.getElementById(`b${i}`).value));
                restricciones.push(restriccion);
            }

            // Preparar la tabla inicial para el método Simplex
            const tabla = preparartabla(funcionObjetivo, restricciones, tipoProblema);

            // Resolver el problema de programación lineal utilizando el método Simplex
            const solucion = metodoSimplex(tabla, tipoProblema);

            // Mostrar el resultado en la página web
            mostrarResultado(solucion, numVariables);
        }

        // Función para preparar la tabla inicial para el método Simplex
        function preparartabla(funcionObjetivo, restricciones, tipoProblema) {
            // Obtener el número de variables y restricciones
            const numVariables = funcionObjetivo.length;
            const numRestricciones = restricciones.length;

            // Inicializar la tabla con filas para la función objetivo y las restricciones
            const tabla = [];

            // Añadir la fila para la función objetivo
            const filaObjetivo = new Array(numVariables + numRestricciones + 1).fill(0);
            for (let i = 0; i < numVariables; i++) {
                filaObjetivo[i] = tipoProblema === 'minimizar' ? -funcionObjetivo[i] : funcionObjetivo[i];
            }
            tabla.push(filaObjetivo);

            // Añadir las filas para las restricciones
            for (let i = 0; i < numRestricciones; i++) {
                const filaRestriccion = new Array(numVariables + numRestricciones + 1).fill(0);
                for (let j = 0; j < numVariables; j++) {
                    filaRestriccion[j] = restricciones[i][j];
                }
                filaRestriccion[numVariables + i] = 1; // Variable de holgura
                filaRestriccion[numVariables + numRestricciones] = -restricciones[i][numVariables];
                tabla.push(filaRestriccion);
            }

            return tabla;
        }

        // Función para resolver el problema de programación lineal utilizando el método Simplex
        function metodoSimplex(tabla, tipoProblema) {
            // Obtener el número de filas y columnas de la tabla
            const numFilas = tabla.length;
            const numColumnas = tabla[0].length;

            // Repetir el proceso de pivoteo hasta encontrar una solución óptima
            while (true) {
                // Encontrar la columna pivote (entrada)
                let columnaPivote = encontrarColumnaPivote(tabla[0]);
                if (columnaPivote === -1) break; // Solución óptima encontrada

                // Encontrar la fila pivote (salida)
                let filaPivote = encontrarFilaPivote(tabla, columnaPivote);
                if (filaPivote === -1) return "El problema no tiene solución acotada";

                // Realizar la operación de pivoteo
                pivote(tabla, filaPivote, columnaPivote);
            }

            return extraerSolucion(tabla);
        }

        // Función para encontrar la columna pivote (entrada) en la tabla
        function encontrarColumnaPivote(filaObjetivo) {
            let minimo = 0;
            let indice = -1;
            for (let i = 0; i < filaObjetivo.length - 1; i++) {
                if (filaObjetivo[i] < minimo) {
                    minimo = filaObjetivo[i];
                    indice = i;
                }
            }
            return indice;
        }

        // Función para encontrar la fila pivote (salida) en la tabla
        function encontrarFilaPivote(tabla, columnaPivote) {
            let minimo = Infinity;
            let indice = -1;
            for (let i = 1; i < tabla.length; i++) {
                if (tabla[i][columnaPivote] > 0) {
                    let ratio = tabla[i][tabla[i].length - 1] / tabla[i][columnaPivote];
                    if (ratio < minimo) {
                        minimo = ratio;
                        indice = i;
                    }
                }
            }
            return indice;
        }

        // Función para realizar la operación de pivoteo en la tabla
        function pivote(tabla, filaPivote, columnaPivote) {
            const elementoPivote = tabla[filaPivote][columnaPivote];

            // Normalizar la fila pivote
            for (let j = 0; j < tabla[filaPivote].length; j++) {
                tabla[filaPivote][j] /= elementoPivote;
            }

            // Actualizar las otras filas
            for (let i = 0; i < tabla.length; i++) {
                if (i !== filaPivote) {
                    const factor = tabla[i][columnaPivote];
                    for (let j = 0; j < tabla[i].length; j++) {
                        tabla[i][j] -= factor * tabla[filaPivote][j];
                    }
                }
            }
        }

        // Función para extraer la solución del problema de programación lineal
        function extraerSolucion(tabla) {
            const numVariables = tabla[0].length - tabla.length - 1;
            const solucion = new Array(numVariables).fill(0);

            for (let j = 0; j < numVariables; j++) {
                let cuentaUnos = 0;
                let indiceUno = -1;
                for (let i = 1; i < tabla.length; i++) {
                    if (Math.abs(tabla[i][j] - 1) < 1e-6) {
                        cuentaUnos++;
                        indiceUno = i;
                    } else if (Math.abs(tabla[i][j]) > 1e-6) {
                        cuentaUnos = 0;
                        break;
                    }
                }
                if (cuentaUnos === 1) {
                    solucion[j] = tabla[indiceUno][tabla[indiceUno].length - 1];
                }
            }

            const valorObjetivo = tabla[0][tabla[0].length - 1];
            return { solucion, valorObjetivo };
        }

        // Función para mostrar el resultado en la página web
        function mostrarResultado(solucion, numVariables) {
            let resultadoHTML = '<h3>Resultado</h3>';
            resultadoHTML += '<p>Valor de la función objetivo: ' + solucion.valorObjetivo + '</p>';
            resultadoHTML += '<h4>Valores de las variables:</h4><ul>';

            for (let i = 0; i < numVariables; i++) {
                resultadoHTML += '<li>x' + (i + 1) + ' = ' + solucion.solucion[i] + '</li>';
            }
            resultadoHTML += '</ul>';

            document.getElementById('resultado').innerHTML = resultadoHTML;
        }
        restriccionesHTML += `
            <label for="b${i}">Término independiente:</label>
            <input type="number" id="b${i}" step="any" required>
        `;
    }

    document.getElementById('funcionObjetivo').innerHTML = funcionObjetivoHTML;
    document.getElementById('restricciones').innerHTML = restriccionesHTML;
}

function resolverSimplex() {
    const numVariables = parseInt(document.getElementById('numVariables').value);
    const tipoProblema = document.getElementById('tipoProblema').value;

    // Obtener coeficientes de la función objetivo
    const funcionObjetivo = [];
    for (let i = 1; i <= numVariables; i++) {
        funcionObjetivo.push(parseFloat(document.getElementById(`fo${i}`).value));
    }

    // Obtener coeficientes y términos independientes de las restricciones
    const restricciones = [];
    for (let i = 1; i <= numVariables; i++) {
        const restriccion = [];
        for (let j = 1; j <= numVariables; j++) {
            restriccion.push(parseFloat(document.getElementById(`r${i}_${j}`).value));
        }
        restriccion.push(parseFloat(document.getElementById(`b${i}`).value));
        restricciones.push(restriccion);
    }

    // Preparar la tabla inicial
    const tabla = preparartabla(funcionObjetivo, restricciones, tipoProblema);

    // Resolver usando el método simplex
    const solucion = metodoSimplex(tabla, tipoProblema);

    // Mostrar el resultado
    mostrarResultado(solucion, numVariables);
}

function preparartabla(funcionObjetivo, restricciones, tipoProblema) {
    const numVariables = funcionObjetivo.length;
    const numRestricciones = restricciones.length;
    const tabla = [];

    // Añadir función objetivo a la tabla
    const filaObjetivo = new Array(numVariables + numRestricciones + 1).fill(0);
    for (let i = 0; i < numVariables; i++) {
        filaObjetivo[i] = tipoProblema === 'minimizar' ? funcionObjetivo[i] : -funcionObjetivo[i];
    }
    tabla.push(filaObjetivo);

    // Añadir restricciones a la tabla
    for (let i = 0; i < numRestricciones; i++) {
        const filaRestriccion = new Array(numVariables + numRestricciones + 1).fill(0);
        for (let j = 0; j < numVariables; j++) {
            filaRestriccion[j] = restricciones[i][j];
        }
        filaRestriccion[numVariables + i] = 1; // Variable de holgura
        filaRestriccion[numVariables + numRestricciones] = restricciones[i][numVariables];
        tabla.push(filaRestriccion);
    }

    return tabla;
}

function metodoSimplex(tabla, tipoProblema) {
    const numFilas = tabla.length;
    const numColumnas = tabla[0].length;

    while (true) {
        // Encontrar la columna pivote (entrada)
        let columnaPivote = encontrarColumnaPivote(tabla[0]);
        if (columnaPivote === -1) break; // Solución óptima encontrada

        // Encontrar la fila pivote (salida)
        let filaPivote = encontrarFilaPivote(tabla, columnaPivote);
        if (filaPivote === -1) return "El problema no tiene solución acotada";

        // Realizar la operación de pivote
        pivote(tabla, filaPivote, columnaPivote);
    }

    return extraerSolucion(tabla);
}

function encontrarColumnaPivote(filaObjetivo) {
    let minimo = 0;
    let indice = -1;
    for (let i = 0; i < filaObjetivo.length - 1; i++) {
        if (filaObjetivo[i] < minimo) {
            minimo = filaObjetivo[i];
            indice = i;
        }
    }
    return indice;
}

function encontrarFilaPivote(tabla, columnaPivote) {
    let minimo = Infinity;
    let indice = -1;
    for (let i = 1; i < tabla.length; i++) {
        if (tabla[i][columnaPivote] > 0) {
            let ratio = tabla[i][tabla[i].length - 1] / tabla[i][columnaPivote];
            if (ratio < minimo) {
                minimo = ratio;
                indice = i;
            }
        }
    }
    return indice;
}

function pivote(tabla, filaPivote, columnaPivote) {
    const elementoPivote = tabla[filaPivote][columnaPivote];

    // Normalizar la fila pivote
    for (let j = 0; j < tabla[filaPivote].length; j++) {
        tabla[filaPivote][j] /= elementoPivote;
    }

    // Actualizar las otras filas
    for (let i = 0; i < tabla.length; i++) {
        if (i !== filaPivote) {
            const factor = tabla[i][columnaPivote];
            for (let j = 0; j < tabla[i].length; j++) {
                tabla[i][j] -= factor * tabla[filaPivote][j];
            }
        }
    }
}

function extraerSolucion(tabla) {
    const numVariables = tabla[0].length - tabla.length;
    const solucion = new Array(numVariables).fill(0);

    for (let j = 0; j < numVariables; j++) {
        let cuentaUnos = 0;
        let indiceUno = -1;
        for (let i = 1; i < tabla.length; i++) {
            if (Math.abs(tabla[i][j] - 1) < 1e-6) {
                cuentaUnos++;
                indiceUno = i;
            } else if (Math.abs(tabla[i][j]) > 1e-6) {
                cuentaUnos = 0;
                break;
            }
        }
        if (cuentaUnos === 1) {
            solucion[j] = tabla[indiceUno][tabla[indiceUno].length - 1];
        }
    }

    const valorObjetivo = tabla[0][tabla[0].length - 1];
    return { solucion, valorObjetivo };
}

function mostrarResultado(solucion, numVariables) {
    let resultadoHTML = '<h3>Resultado</h3>';
    resultadoHTML += '<p>Valor de la función objetivo: ' + solucion.valorObjetivo + '</p>';
    resultadoHTML += '<h4>Valores de las variables:</h4><ul>';

    for (let i = 0; i < numVariables; i++) {
        resultadoHTML += '<li>x' + (i + 1) + ' = ' + solucion.solucion[i] + '</li>';
    }
    resultadoHTML += '</ul>';

    document.getElementById('resultado').innerHTML = resultadoHTML;
}
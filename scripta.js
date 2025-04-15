function calcularFrecuencias() {
    const dataInput = document.getElementById('dataInput').value;
    const datos = dataInput.split(',').map(Number);
    const n = datos.length;

    if (n === 0) {
        alert("Por favor, ingrese datos válidos.");
        return;
    }

    const min = Math.min(...datos);
    const max = Math.max(...datos);
    const rango = max - min;
    const numClases = Math.max(1, Math.ceil(1 + 3.3 * Math.log10(n))); // Cambiar a 1 para permitir al menos una clase
    const anchoClase = rango / numClases;

    const bins = Array.from({ length: numClases + 1 }, (_, i) => min + i * anchoClase);
    const frecuencias = Array(numClases).fill(0);
    const frecuenciasAcumuladas = Array(numClases).fill(0);
    const frecuenciasRelativas = Array(numClases).fill(0);
    const marcasDeClase = Array(numClases).fill(0);
    const limitesRealesInferiores = Array(numClases).fill(0);
    const limitesRealesSuperiores = Array(numClases).fill(0);

    // Contar frecuencias
    datos.forEach(dato => {
        for (let i = 0; i < numClases; i++) {
            if (dato >= bins[i] && dato <= bins[i + 1]) {
                frecuencias[i]++;
                break;
            }
        }
    });

    // Calcular frecuencias acumuladas, frecuencias relativas y marcas de clase
    let sumaAcumulada = 0;
    for (let i = 0; i < numClases; i++) {
        sumaAcumulada += frecuencias[i];
        frecuenciasAcumuladas[i] = sumaAcumulada;
        frecuenciasRelativas[i] = (frecuencias[i] / n).toFixed(2);
        marcasDeClase[i] = ((bins[i] + bins[i + 1]) / 2).toFixed(2);
        limitesRealesInferiores[i] = (bins[i] - 0.5).toFixed(2);
        limitesRealesSuperiores[i] = (bins[i + 1] + 0.5).toFixed(2);
    }

    // Mostrar resultados
    const resultadosDiv = document.getElementById('resultados');
    let resultadosHTML = "<h2>Resultados</h2><table><tr><th>Clase</th><th>Frecuencia</th><th>Frecuencia Relativa</th><th>Frecuencia Acumulada</th><th>Marca de Clase</th><th>Límite Inferior</th><th>Límite Superior</th><th>Límite Inferior Real</th><th>Límite Superior Real</th></tr>";
    for (let i = 0; i < numClases; i++) {
        resultadosHTML += `<tr>
            <td>${i + 1}</td>
            <td>${frecuencias[i]}</td>
            <td>${frecuenciasRelativas[i]}</td>
            <td>${frecuenciasAcumuladas[i]}</td>
            <td>${marcasDeClase[i]}</td>
            <td>${bins[i].toFixed(2)}</td>
            <td>${bins[i + 1].toFixed(2)}</td>
            <td>${limitesRealesInferiores[i]}</td>
            <td>${limitesRealesSuperiores[i]}</td>
        </tr>`;
    }
    resultadosHTML += "</table>";
    resultadosDiv.innerHTML = resultadosHTML;
}
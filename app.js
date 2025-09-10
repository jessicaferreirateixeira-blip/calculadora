// Configurações da API do Gemini
const API_KEY = ""; 
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=" + API_KEY;

// Elementos do DOM
const num1Input = document.getElementById('num1');
const num2Input = document.getElementById('num2');
const operacaoSelect = document.getElementById('operacao');
const resultadoElement = document.getElementById('valor-resultado');
const statusElement = document.getElementById('status-resultado');
const historicoElement = document.getElementById('historico');
const explicacaoElement = document.getElementById('explicacao');
const explicarButton = document.querySelector('button[onclick="explicarCalculo()"]');

let historico = [];

// Funções para conversão de Base64 para ArrayBuffer e criação de WAV
function base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

function pcmToWav(pcmData, sampleRate) {
    const dataView = new DataView(new ArrayBuffer(44 + pcmData.byteLength));
    let offset = 0;

    // RIFF identifier
    dataView.setUint8(offset, 'R'.charCodeAt(0)); offset++;
    dataView.setUint8(offset, 'I'.charCodeAt(0)); offset++;
    dataView.setUint8(offset, 'F'.charCodeAt(0)); offset++;
    dataView.setUint8(offset, 'F'.charCodeAt(0)); offset++;
    // file length (36 + data length)
    dataView.setUint32(offset, 36 + pcmData.byteLength, true); offset += 4;
    // 'WAVE' identifier
    dataView.setUint8(offset, 'W'.charCodeAt(0)); offset++;
    dataView.setUint8(offset, 'A'.charCodeAt(0)); offset++;
    dataView.setUint8(offset, 'V'.charCodeAt(0)); offset++;
    dataView.setUint8(offset, 'E'.charCodeAt(0)); offset++;
    // 'fmt ' chunk
    dataView.setUint8(offset, 'f'.charCodeAt(0)); offset++;
    dataView.setUint8(offset, 'm'.charCodeAt(0)); offset++;
    dataView.setUint8(offset, 't'.charCodeAt(0)); offset++;
    dataView.setUint8(offset, ' '.charCodeAt(0)); offset++;
    // chunk length (16 for PCM)
    dataView.setUint32(offset, 16, true); offset += 4;
    // audio format (1 for PCM)
    dataView.setUint16(offset, 1, true); offset += 2;
    // number of channels (1)
    dataView.setUint16(offset, 1, true); offset += 2;
    // sample rate
    dataView.setUint32(offset, sampleRate, true); offset += 4;
    // byte rate (sample rate * num channels * bytes per sample)
    dataView.setUint32(offset, sampleRate * 1 * 2, true); offset += 4;
    // block align (num channels * bytes per sample)
    dataView.setUint16(offset, 1 * 2, true); offset += 2;
    // bits per sample
    dataView.setUint16(offset, 16, true); offset += 2;
    // 'data' chunk
    dataView.setUint8(offset, 'd'.charCodeAt(0)); offset++;
    dataView.setUint8(offset, 'a'.charCodeAt(0)); offset++;
    dataView.setUint8(offset, 't'.charCodeAt(0)); offset++;
    dataView.setUint8(offset, 'a'.charCodeAt(0)); offset++;
    // data length
    dataView.setUint32(offset, pcmData.byteLength, true); offset += 4;
    
    const pcm16 = new Int16Array(pcmData);
    for (let i = 0; i < pcm16.length; i++) {
        dataView.setInt16(offset, pcm16[i], true);
        offset += 2;
    }

    return new Blob([dataView], { type: 'audio/wav' });
}

function atualizarHistorico(calculo, resultado) {
    const historicoItem = document.createElement('div');
    historicoItem.className = 'bg-white p-2 rounded-lg shadow text-slate-700';
    historicoItem.innerHTML = `<span class="font-bold">${calculo} =</span> <span class="font-semibold text-indigo-600">${resultado}</span>`;
    historicoElement.prepend(historicoItem);
}

function realizarCalculo() {
    const num1 = parseFloat(num1Input.value);
    const num2 = parseFloat(num2Input.value);
    const operacao = operacaoSelect.value;
    let resultado;
    let calculo;

    if (isNaN(num1) || isNaN(num2)) {
        resultadoElement.textContent = "Erro";
        statusElement.textContent = "Por favor, insira números válidos.";
        explicacaoElement.textContent = "";
        return;
    }

    switch (operacao) {
        case 'soma':
            resultado = num1 + num2;
            calculo = `${num1} + ${num2}`;
            break;
        case 'subtracao':
            resultado = num1 - num2;
            calculo = `${num1} - ${num2}`;
            break;
        case 'multiplicacao':
            resultado = num1 * num2;
            calculo = `${num1} * ${num2}`;
            break;
        case 'divisao':
            if (num2 === 0) {
                resultadoElement.textContent = "Erro";
                statusElement.textContent = "Não é possível dividir por zero.";
                explicacaoElement.textContent = "";
                return;
            }
            resultado = num1 / num2;
            calculo = `${num1} / ${num2}`;
            break;
    }

    // Verifica se o resultado é zero para formatar corretamente
    const resultadoFormatado = (resultado === 0) ? "0" : resultado.toFixed(2);

    resultadoElement.textContent = resultadoFormatado;
    statusElement.textContent = "Cálculo realizado!";
    atualizarHistorico(calculo, resultadoFormatado);
    explicacaoElement.textContent = "";
}

async function explicarCalculo() {
    const num1 = parseFloat(num1Input.value);
    const num2 = parseFloat(num2Input.value);
    const operacao = operacaoSelect.value;
    let operacaoTexto;
    
    // Obter o texto da operação para o prompt
    switch (operacao) {
        case 'soma':
            operacaoTexto = 'adição';
            break;
        case 'subtracao':
            operacaoTexto = 'subtração';
            break;
        case 'multiplicacao':
            operacaoTexto = 'multiplicação';
            break;
        case 'divisao':
            operacaoTexto = 'divisão';
            break;
    }

    if (isNaN(num1) || isNaN(num2)) {
        explicacaoElement.textContent = "Por favor, insira números válidos para a explicação.";
        return;
    }

    explicarButton.disabled = true;
    explicacaoElement.textContent = "A pensar numa explicação...";

    try {
        const prompt = `Explique o seguinte cálculo matemático de forma simples para uma criança de 10 anos: ${num1} ${operacaoTexto} ${num2}. Não inclua a resposta final no texto.`;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: {
                parts: [{ text: "Atua como um professor de matemática amigável e simpático que explica conceitos de forma fácil de entender." }]
            },
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Erro de HTTP! status: ${response.status}`);
        }

        const result = await response.json();
        const generatedText = result?.candidates?.[0]?.content?.parts?.[0]?.text || "Não foi possível gerar uma explicação. Tente novamente.";
        
        explicacaoElement.textContent = generatedText;

    } catch (error) {
        console.error("Erro ao chamar a API:", error);
        explicacaoElement.textContent = "Ocorreu um erro ao obter a explicação. Tente novamente.";
    } finally {
        explicarButton.disabled = false;
    }
}

function limparTudo() {
    num1Input.value = '';
    num2Input.value = '';
    operacaoSelect.value = 'soma';
    resultadoElement.textContent = '0';
    statusElement.textContent = '';
    historicoElement.innerHTML = '';
    explicacaoElement.textContent = '';
}

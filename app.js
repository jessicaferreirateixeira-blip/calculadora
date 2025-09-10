// Funções para operações matemáticas básicas
function adicao(a, b) {
    return a + b;
}

function subtracao(a, b) {
    return a - b;
}

function multiplicacao(a, b) {
    return a * b;
}

function divisao(a, b) {
    // Verifica se o divisor (b) é zero para evitar erro.
    if (b === 0) {
        return "Erro: divisão por zero.";
    }
    return a / b;
}

function calculadora(operacao, a, b) {
    // Verifica se os parâmetros de entrada são números válidos
    if (typeof a !== 'number' || typeof b !== 'number' || isNaN(a) || isNaN(b)) {
        return "Erro: Parâmetros inválidos. Insira apenas números.";
    }

    switch (operacao) {
        case 'soma':
            return adicao(a, b);
        case 'subtracao':
            return subtracao(a, b);
        case 'multiplicacao':
            return multiplicacao(a, b);
        case 'divisao':
            return divisao(a, b);
        default:
            return "Operação inválida.";
    }
}

function verificarParOuImpar(numero) {
    // Verifica se a entrada é um número antes de fazer a operação
    if (typeof numero !== 'number' || isNaN(numero)) {
        return "Não é um número.";
    }
    
    if (numero % 2 === 0) {
        return "Par";
    } else {
        return "Ímpar";
    }
}

// Função que pega os valores do HTML e exibe o resultado
function realizarCalculo() {
    let num1 = parseFloat(document.getElementById('num1').value);
    let num2 = parseFloat(document.getElementById('num2').value);
    let operacao = document.getElementById('operacao').value;

    if (isNaN(num1) || isNaN(num2)) {
        document.getElementById('resultado').textContent = "Por favor, insira números válidos.";
        return;
    }
    
    let resultado = calculadora(operacao, num1, num2);
    let status = verificarParOuImpar(resultado);

    const elementoResultado = document.getElementById('resultado');
    if (elementoResultado) {
        // Combina o resultado e o status para exibir
        const textoCompleto = `${resultado} (${status})`;
        elementoResultado.textContent = textoCompleto;
    } else {
        console.error("Erro: Elemento com ID 'resultado' não encontrado no HTML.");
    }
}

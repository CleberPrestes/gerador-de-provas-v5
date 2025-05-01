let questoes = [];
let questaoEditando = null;

function salvarQuestao() {
  const enunciado = document.getElementById('enunciado').value.trim();
  const A = document.getElementById('altA').value.trim();
  const B = document.getElementById('altB').value.trim();
  const C = document.getElementById('altC').value.trim();
  const D = document.getElementById('altD').value.trim();
  const E = document.getElementById('altE').value.trim();

  if (!enunciado || !A || !B || !C || !D || !E) {
    alert('Preencha todos os campos.');
    return;
  }

  if (questaoEditando !== null) {
    const questao = questoes.find(q => q.numero === questaoEditando);
    questao.enunciado = enunciado;
    questao.alternativas = { A, B, C, D, E };
    questaoEditando = null;
  } else {
    const novaQuestao = {
      numero: questoes.length + 1,
      enunciado,
      alternativas: { A, B, C, D, E }
    };
    questoes.push(novaQuestao);
  }

  limparFormulario();
  atualizarLista();
}

function cancelarEdicao() {
  limparFormulario();
  questaoEditando = null;
}

function limparFormulario() {
  document.getElementById('enunciado').value = '';
  document.getElementById('altA').value = '';
  document.getElementById('altB').value = '';
  document.getElementById('altC').value = '';
  document.getElementById('altD').value = '';
  document.getElementById('altE').value = '';
  atualizarPrevia();
}

function atualizarLista() {
  const ul = document.getElementById('listaQuestoes');
  ul.innerHTML = '';
  questoes.forEach(q => {
    const li = document.createElement('li');
    li.innerText = `Questão ${q.numero}: ${q.enunciado}`;

    const btnEditar = document.createElement('button');
    btnEditar.innerText = 'Editar';
    btnEditar.onclick = () => editarQuestao(q.numero);

    li.appendChild(btnEditar);
    ul.appendChild(li);
  });
}

function editarQuestao(numero) {
  const questao = questoes.find(q => q.numero === numero);
  if (!questao) {
    alert('Questão não encontrada.');
    return;
  }

  document.getElementById('enunciado').value = questao.enunciado;
  document.getElementById('altA').value = questao.alternativas.A;
  document.getElementById('altB').value = questao.alternativas.B;
  document.getElementById('altC').value = questao.alternativas.C;
  document.getElementById('altD').value = questao.alternativas.D;
  document.getElementById('altE').value = questao.alternativas.E;

  atualizarPrevia();
  questaoEditando = numero;
}

function atualizarPrevia() {
  const enunciado = document.getElementById('enunciado').value;
  const A = document.getElementById('altA').value;
  const B = document.getElementById('altB').value;
  const C = document.getElementById('altC').value;
  const D = document.getElementById('altD').value;
  const E = document.getElementById('altE').value;

  const previewDiv = document.getElementById('previewQuestao');
  if (enunciado.trim() === '') {
    previewDiv.innerHTML = '<em>Digite o enunciado e as alternativas para ver a pré-visualização...</em>';
    return;
  }

  previewDiv.innerHTML = `
    <strong>Enunciado:</strong> ${enunciado}<br><br>
    <strong>A)</strong> ${A}<br>
    <strong>B)</strong> ${B}<br>
    <strong>C)</strong> ${C}<br>
    <strong>D)</strong> ${D}<br>
    <strong>E)</strong> ${E}<br>
  `;
}

function embaralharAlternativas(alternativas) {
  const letras = Object.keys(alternativas);
  const valores = Object.values(alternativas);
  const embaralhadas = valores
    .map(v => ({ v, o: Math.random() }))
    .sort((a, b) => a.o - b.o)
    .map((el, i) => [letras[i], el.v]);
  return Object.fromEntries(embaralhadas);
}

function gerarVersoesPDF() {
  const nomeBase = document.getElementById("nomeArquivo").value.trim() || "prova";

  for (let v = 1; v <= 3; v++) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text('Nome: _______________________________', 10, y);
    doc.text('Número: ____', 100, y);
    doc.text('Série: _____', 130, y);
    doc.text('Data: ___/__/______', 155, y);

    y += 8;
    doc.setFontSize(17);
    doc.text(`Avaliação - Valor:`, 105, y, { align: 'center' });

    doc.setFontSize(12);
    y += 8;

    const espacamento = 5;
    const xColuna1 = 10;
    const xColuna2 = 105;

    const questoesVersao = questoes.map(q => ({
      numero: q.numero,
      enunciado: q.enunciado,
      alternativas: embaralharAlternativas(q.alternativas)
    }));

    for (let i = 0; i < questoesVersao.length; i += 2) {
      let yInicioLinha = y;

      const q1 = questoesVersao[i];
      const linhasEnunciado1 = doc.splitTextToSize(`Quest. ${q1.numero}: ${q1.enunciado}`, 85);
      doc.text(linhasEnunciado1, xColuna1, yInicioLinha);
      yInicioLinha += linhasEnunciado1.length * espacamento;

      let altLetra = Object.keys(q1.alternativas);
      let altValor = Object.values(q1.alternativas);
      for (let j = 0; j < 5; j++) {
        const textoAlt = `${altLetra[j]}) ${altValor[j]}`;
        const linhasAlt = doc.splitTextToSize(textoAlt, 85);
        doc.text(linhasAlt, xColuna1 + 5, yInicioLinha);
        yInicioLinha += linhasAlt.length * espacamento;
      }

      const alturaQ1 = yInicioLinha;
      yInicioLinha = y;

      if (i + 1 < questoesVersao.length) {
        const q2 = questoesVersao[i + 1];
        const linhasEnunciado2 = doc.splitTextToSize(`Quest. ${q2.numero}: ${q2.enunciado}`, 85);
        doc.text(linhasEnunciado2, xColuna2, yInicioLinha);
        yInicioLinha += linhasEnunciado2.length * espacamento;

        altLetra = Object.keys(q2.alternativas);
        altValor = Object.values(q2.alternativas);
        for (let j = 0; j < 5; j++) {
          const textoAlt = `${altLetra[j]}) ${altValor[j]}`;
          const linhasAlt = doc.splitTextToSize(textoAlt, 85);
          doc.text(linhasAlt, xColuna2 + 5, yInicioLinha);
          yInicioLinha += linhasAlt.length * espacamento;
        }

        const alturaQ2 = yInicioLinha;
        y = Math.max(alturaQ1, alturaQ2) + espacamento;
      } else {
        y = alturaQ1 + espacamento;
      }

      if (y > 285) {
        doc.addPage();
        y = 10;
      }
    }

    doc.save(`${nomeBase}_versao_${v}.pdf`);
  }
}

function baixarJSON() {
  const nomeBase = document.getElementById("nomeArquivo").value.trim() || "questoes";
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questoes, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `${nomeBase}.json`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function importarQuestoes(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data)) {
        questoes = data.map((q, idx) => ({
          numero: idx + 1,
          enunciado: q.enunciado,
          alternativas: q.alternativas
        }));
        atualizarLista();
      } else {
        alert('Arquivo inválido.');
      }
    } catch (err) {
      alert('Erro ao ler arquivo.');
    }
  };
  reader.readAsText(file);
}

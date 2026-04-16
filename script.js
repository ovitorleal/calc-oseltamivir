const inputPerfil = document.getElementById('perfil');
const inputPeso = document.getElementById('peso');
const infoDose = document.getElementById('info-dose');
const campoPeso = document.getElementById('campo-peso');

const resDose = document.getElementById('res-dose');
const resDoseUnit = document.getElementById('res-dose-unit');
const resFreq = document.getElementById('res-freq');
const resDur = document.getElementById('res-dur');
const resML = document.getElementById('res-ml');
const blocoSuspensao = document.getElementById('bloco-suspensao');
const obsList = document.getElementById('obs-list');
const containerResultados = document.getElementById('resultados');
const placeholder = document.getElementById('placeholder');
const btnLimpar = document.getElementById('btn-limpar');

// Perfis que dependem do peso do paciente
const precisaPeso = ['crianca_maior_1a', 'crianca_0_8m', 'crianca_9_11m',
    'neonatal_prematuro', 'neonatal_38_40', 'neonatal_gt40'];

// Texto informativo para cada perfil
const INFO_PERFIL = {
    adulto: 'Via oral, 12/12h, 5 dias',
    crianca_maior_1a: 'Dose por faixa de peso. Via oral, 12/12h, 5 dias',
    crianca_0_8m: '3 mg/kg/dose. Via oral, 12/12h, 5 dias',
    crianca_9_11m: '3,5 mg/kg/dose. Via oral, 12/12h, 5 dias',
    neonatal_prematuro: '1 mg/kg/dose. Via oral, 12/12h, 5 dias',
    neonatal_38_40: '1,5 mg/kg/dose. Via oral, 12/12h, 5 dias',
    neonatal_gt40: '3 mg/kg/dose. Via oral, 12/12h, 5 dias',

};

// ─── Exibe o resultado no card ─────────────────────────────────────────────
function mostrarResultado(dose, unit, freq, dur, obs) {
    containerResultados.classList.remove('hidden');
    placeholder.classList.add('hidden');

    resDose.innerText = dose;
    resDoseUnit.innerText = unit;
    resFreq.innerText = freq;
    resDur.innerText = dur;
    obsList.innerHTML = obs.map(o => `<li>${o}</li>`).join('');
}

// ─── Exibe volume em suspensão ─────────────────────────────────────────────
function mostrarSuspensao(doseMg) {
    const ml = doseMg / 6;
    resML.innerText = ml.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    blocoSuspensao.classList.remove('hidden');
}

// ─── Lógica principal de cálculo ────────────────────────────────────────────
function calcular() {
    const perfil = inputPerfil.value;
    const peso = parseFloat(inputPeso.value);

    // Reseta bloco de suspensão a cada cálculo
    blocoSuspensao.classList.add('hidden');
    obsList.innerHTML = '';

    // ── Adulto ──────────────────────────────────────────────────────────────
    if (perfil === 'adulto') {
        mostrarResultado('75', 'mg', '12/12h', '5', [
            'Oseltamivir 75 mg (1 cápsula), via oral.',
            'Total: 10 tomadas ao longo de 5 dias.',
        ]);
        return;
    }



    // ── Perfis que precisam de peso ──────────────────────────────────────────
    if (!precisaPeso.includes(perfil)) return;

    if (isNaN(peso) || peso <= 0) {
        containerResultados.classList.add('hidden');
        placeholder.classList.remove('hidden');
        return;
    }

    // ── Criança ≥ 1 ano (dose por faixa de peso) ────────────────────────────
    if (perfil === 'crianca_maior_1a') {
        let doseFixa, obs;

        if (peso > 40) {
            doseFixa = 75;
            obs = [
                'Peso > 40 kg: dose equivalente ao adulto (75 mg).',
                'Oseltamivir 75 mg (1 cápsula), via oral.',
            ];
        } else if (peso > 23) {
            doseFixa = 60;
            obs = ['Peso > 23 kg e ≤ 40 kg: dose de 60 mg, via oral.'];
        } else if (peso > 15) {
            doseFixa = 45;
            obs = ['Peso > 15 kg e ≤ 23 kg: dose de 45 mg, via oral.'];
        } else {
            doseFixa = 30;
            obs = ['Peso ≤ 15 kg: dose de 30 mg, via oral.'];
        }

        obs.push('Total: 10 tomadas ao longo de 5 dias.');

        mostrarResultado(doseFixa, 'mg', '12/12h', '5', obs);
        mostrarSuspensao(doseFixa);
        return;
    }

    // ── Criança < 1 ano e Neonatal (dose por kg) ────────────────────────────
    const DOSE_KG = {
        crianca_0_8m: 3,
        crianca_9_11m: 3.5,
        neonatal_prematuro: 1,
        neonatal_38_40: 1.5,
        neonatal_gt40: 3,
    };

    const doseKg = DOSE_KG[perfil];
    const doseMg = peso * doseKg;

    const obs = [
        `Cálculo: ${doseKg.toLocaleString('pt-BR')} mg/kg × ${peso.toLocaleString('pt-BR')} kg = ${doseMg.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mg por tomada.`,
        'Utilizar preferencialmente suspensão oral (6 mg/mL).',
        'Total: 10 tomadas ao longo de 5 dias.',
    ];

    mostrarResultado(
        doseMg.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        'mg',
        '12/12h',
        '5',
        obs
    );
    mostrarSuspensao(doseMg);
}

// ─── Atualiza interface ao trocar perfil ─────────────────────────────────────
function atualizarPerfil() {
    const perfil = inputPerfil.value;

    infoDose.innerText = INFO_PERFIL[perfil] || '';

    // Mostra/oculta campo de peso
    if (precisaPeso.includes(perfil)) {
        campoPeso.classList.remove('hidden');
        // Limpa resultado anterior e mostra placeholder se não houver peso
        const peso = parseFloat(inputPeso.value);
        if (isNaN(peso) || peso <= 0) {
            containerResultados.classList.add('hidden');
            placeholder.classList.remove('hidden');
        }
    } else {
        campoPeso.classList.add('hidden');
        placeholder.classList.add('hidden');
        calcular(); // Perfil sem peso: exibe resultado imediatamente
    }
}

// ─── Eventos ─────────────────────────────────────────────────────────────────
inputPerfil.addEventListener('change', atualizarPerfil);
inputPeso.addEventListener('input', calcular);

btnLimpar.addEventListener('click', () => {
    inputPerfil.value = 'adulto';
    inputPeso.value = '';
    atualizarPerfil();
});

// Inicialização — exibe resultado para o perfil padrão (adulto)
atualizarPerfil();

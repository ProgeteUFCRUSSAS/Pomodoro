document.addEventListener('DOMContentLoaded', (event) => {
    // Tempos iniciais em segundos
    const tempos = {
        pomo: 25 * 60,  // 25 minutos
        long: 10 * 60,  // 10 minutos
        rest: 5 * 60    // 5 minutos
    };

    let tempo = tempos.pomo; // Tempo inicial (Pomodoro)
    let intervalo;
    let timerAtivo = false;

    // Elementos do DOM
    const relogio = document.getElementById('relogio');
    const iniciar = document.getElementById('Iniciar');
    const pausar = document.getElementById('Pausar');
    const resetar = document.getElementById('Resetar');
    const pomo = document.getElementById('pomo');
    const long = document.getElementById('long');
    const rest = document.getElementById('rest');

    // Função que formata o tempo em mm:ss
    const formatarTempo = (segundos) => {
        const minutos = Math.floor(segundos / 60);
        const segundosRestantes = segundos % 60;
        return `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
    };

    // Atualiza relógio com o tempo formatado
    const atualizarTimer = () => {
        relogio.textContent = formatarTempo(tempo);
    };

    // Função que reduz o tempo
    const reduzirTempo = () => {
        if (tempo > 0) {
            tempo--;
            atualizarTimer();
        } else {
            clearInterval(intervalo);
            alert("O tempo acabou");
        }
    };

    // Função para iniciar o tempo
    const iniciarTempo = () => {
        if (!timerAtivo) {
            timerAtivo = true;
            intervalo = setInterval(reduzirTempo, 1000);
        }
    };

    // Função para pausar o tempo
    const pausarTempo = () => {
        if (timerAtivo) {
            timerAtivo = false;
            clearInterval(intervalo);
        }
    };

    // Função para resetar o tempo
    const resetarTempo = () => {
        pausarTempo();
        if (!pomo.classList.contains('dimmer')) {
            tempo = tempos.pomo; // Pomodoro
        } else if (!long.classList.contains('dimmer')) {
            tempo = tempos.long; // Long Break
        } else if (!rest.classList.contains('dimmer')) {
            tempo = tempos.rest; // Short Break
        }
        atualizarTimer();
    };

    // Função para escurecer os botões não clicados
    const escurecerBotoes = (botaoAtivo) => {
        const botoes = [pomo, long, rest];
        botoes.forEach(botao => {
            if (botao === botaoAtivo) {
                botao.classList.remove('dimmer');
            } else {
                botao.classList.add('dimmer');
            }
        });
    };

    // Eventos que escutam o clique dos botões
    iniciar.addEventListener('click', iniciarTempo);
    pausar.addEventListener('click', pausarTempo);
    resetar.addEventListener('click', resetarTempo);

    // Eventos para os botões de tempo Pomodoro, Long e Rest
    pomo.addEventListener('click', () => {
        tempo = tempos.pomo; // 25 minutos
        atualizarTimer();
        escurecerBotoes(pomo);
        resetarTempo(pomo)
    });

    long.addEventListener('click', () => {
        tempo = tempos.long; // 10 minutos
        atualizarTimer();
        escurecerBotoes(long);
        resetarTempo(long)
    });

    rest.addEventListener('click', () => {
        tempo = tempos.rest; // 5 minutos
        atualizarTimer();
        escurecerBotoes(rest);
        resetarTempo(rest)
    });

    // Inicializar o timer na página
    atualizarTimer();
});

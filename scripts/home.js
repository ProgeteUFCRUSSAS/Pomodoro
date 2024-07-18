document.addEventListener('DOMContentLoaded', (event) =>{
    //tempo inicial (25 minutos) em segundos
    const tempoinicial = 25 * 60;
    let tempo = tempoinicial;
    let intervalo;
    let timerAtivo = false;

    //
    const relogio = document.getElementById('relogio');
    const iniciar = document.getElementById('Iniciar');
    const pausar = document.getElementById('Pausar');
    const resetar = document.getElementById('Resetar');

    //função que formata o tempo em mm:ss
    const formatartempo = (segundos) => {
        const minutos = Math.floor(segundos / 60);
        const segundosRestantes = segundos % 60;
        return `${minutos.toString().padStart(2, '0')}: ${segundosRestantes.toString().padStart(2,'0')}`;
    };

    //atualiza relogio com o tempo formatado
    const atualizarTimer = () => {
        relogio.textContent = formatartempo(tempo);
    };

    //função que reduz o tempo
    const reduzirTempo = () => {
        if (tempo > 0) {
            tempo--;
            atualizarTimer();
        } else{
            clearInterval(intervalo);
            alert("o tempo acabou");
        }
    };

    //função para iniciar o tempo
    const iniciarTempo = () => {
        if (!timerAtivo) {
            timerAtivo = true;
            intervalo = setInterval(reduzirTempo, 1000);
        }
    };

    //função de pausar o tempo
    const pausarTempo = () => {
        if (timerAtivo) {
            timerAtivo = false;
            clearInterval(intervalo);
        }
    };

    //função de resetar o tempo
    const resetarTempo = () => {
        pausarTempo();
        tempo = tempoinicial;
        atualizarTimer();
    };


    //evento que escuta o clique do botão de iniciar
    iniciar.addEventListener('click', iniciarTempo);
    pausar.addEventListener('click', pausarTempo);
    resetar.addEventListener('click', resetarTempo);

    //inicializar o timer na página
    atualizarTimer();
});
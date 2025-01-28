document.addEventListener('DOMContentLoaded', () => {
    // Seleção de elementos da DOM
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    
    // Definição dos tempos padrão
    const tempos = {
        pomo: 25 * 60,  // Tempo para Pomodoro (25 minutos)
        long: 10 * 60,  // Tempo de pausa longa (10 minutos)
        rest: 5 * 60,   // Tempo de pausa curta (5 minutos)
        custom: 0,      // Tempo personalizado
    };
    
    let tempo = tempos.pomo; // Inicializa o tempo com o Pomodoro
    let intervalo;           // Variável para o intervalo do timer
    let timerAtivo = false;  // Estado para verificar se o timer está ativo
    let tasks = [];          // Array para armazenar tarefas
    let tasksConcluidas = 0; // Contador de tarefas concluídas
    
    // Seleção de outros elementos da DOM
    const relogio = document.getElementById('relogio');
    const iniciar = document.getElementById('Iniciar');
    const pausar = document.getElementById('Pausar');
    const resetar = document.getElementById('Resetar');
    const pomo = document.getElementById('pomo');
    const long = document.getElementById('long');
    const rest = document.getElementById('rest');
    const custom = document.getElementById('custom-minutes-button');
    const customContainer = document.getElementById('custom-timer-container');
    const setCustomTimer = document.getElementById('set-custom-timer');
    const customMinutesInput = document.getElementById('custom-minutes');
    const customDia = document.getElementById('custom-dia');
    const audio = document.getElementById('audio');
    const body = document.body;
    let valorCustomizadoInicial = 0; // Valor inicial do timer personalizado
    
    const increaseButton = document.getElementById("increase-cycles");
    const decreaseButton = document.getElementById("decrease-cycles");
    const cyclesInput = document.getElementById("task-cycles");
    
    // Função para aumentar o contador de ciclos de uma tarefa
    const increaseTaskCycles = (taskId) => {
        const task = tasks.find(task => task.id === taskId);
        if (task && task.completedCycles < task.totalCycles) {
            task.completedCycles++;
            renderizarTasks(); // Atualiza a interface
        }
    };

    // Função para formatar o tempo no formato HH:MM:SS
    const formatarTempo = (segundos) => {
        const horas = Math.floor(segundos / 3600);
        const minutos = Math.floor((segundos % 3600) / 60);
        const segundosRestantes = segundos % 60;
        return horas > 0
            ? `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`
            : `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
    };

    // Event listeners para aumentar e diminuir o número de ciclos
    increaseButton.addEventListener("click", () => {
        let currentValue = parseInt(cyclesInput.value, 10);
        cyclesInput.value = currentValue + 1;
    });

    decreaseButton.addEventListener("click", () => {
        let currentValue = parseInt(cyclesInput.value, 10);
        if (currentValue > 1) {
            cyclesInput.value = currentValue - 1;
        }
    });

    // Ao clicar no botão de tempo personalizado, abre o modal
    custom.addEventListener('click', () => {
        customDia.showModal();
    });

    // Ao clicar em "Adicionar Tarefa", abre o menu de tarefas
    document.getElementById("adicionar-tarefa").addEventListener("click", () => {
        document.getElementById("menu-dialog").showModal();
    });

    // Ao clicar em "Fechar Menu", fecha o menu de tarefas
    document.getElementById("fechar-menu").addEventListener("click", () => {
        document.getElementById("menu-dialog").close();
    });

    // Função para adicionar uma nova tarefa
    const adicionarTask = (event) => {
        event.preventDefault();

        const TaskTitle = document.getElementById('task-title').value.trim();
        const TaskDesc = document.getElementById('task-desc').value.trim();
        const cyclesInput = document.getElementById("task-cycles");

        // Verificação para garantir que os campos não estejam vazios
        if (TaskTitle === '' || TaskDesc === '') {
            alert('Preencha todos os campos antes de adicionar uma tarefa!');
            return;
        }

        // Adiciona a tarefa ao array de tarefas
        tasks.push({
            id: Date.now(),
            title: TaskTitle,
            desc: TaskDesc,
            completed: false,
            totalCycles: cyclesInput.value,
            completedCycles: 0 // Inicializa com 0 ciclos concluídos
        });

        // Limpa os campos do formulário de tarefas
        document.getElementById('task-title').value = '';
        document.getElementById('task-desc').value = '';

        renderizarTasks(); // Atualiza a interface de tarefas
    };

    // Função para renderizar a lista de tarefas
    const renderizarTasks = () => {
        taskList.innerHTML = ''; // Limpa a lista de tarefas

        tasks.forEach(task => {
            // Cria o item da tarefa na interface
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item');
            taskItem.innerHTML = 
                `<h2>${task.title}</h2>
                <p>${task.desc}</p>
                <p>Ciclos concluídos: ${task.completedCycles}/${task.totalCycles}</p>
                <div class='task-buttons'>
                <button onclick="editTask(${task.id})">Editar</button>
                <button onclick="deleteTask(${task.id})">Excluir</button>
                <button onclick="toggleComplete(${task.id})">${task.completed ? 'Incompleto' : 'Completo'}</button>
                </div>`;
            taskList.appendChild(taskItem); // Adiciona à lista de tarefas
        });
    };

    // Função para editar uma tarefa
    window.editTask = (taskId) => {
        const task = tasks.find(task => task.id === taskId);
        if (task) {
            document.getElementById("menu-dialog").showModal();
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-desc').value = task.desc;
            deleteTask(taskId); // Exclui a tarefa original antes de editar
        }
    };

    // Função para excluir uma tarefa
    window.deleteTask = (taskId) => {
        tasks = tasks.filter(task => task.id !== taskId); // Filtra a tarefa que será excluída
        renderizarTasks(); // Atualiza a lista de tarefas
    };

    // Função para alternar o status de completude da tarefa
    window.toggleComplete = (taskId) => {
        const task = tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed;
            if (task.completed) {
                task.completedCycles++; // Incrementa ciclos concluídos
                if (task.completedCycles >= task.totalCycles) {
                    tasksConcluidas++; // Incrementa tarefas concluídas
                }
            }
            renderizarTasks(); // Atualiza a lista de tarefas
        }
    };

    // Função para iniciar o Pomodoro para uma tarefa
    window.startWithPomodoro = (taskId) => {
        currentTaskId = taskId;
        alert(`Pomodoro iniciado para a tarefa: ${tasks.find(task => task.id === taskId).title}`);
    };

    // Função para atualizar o relógio com o tempo restante
    const atualizarTimer = () => {
        relogio.textContent = formatarTempo(tempo); // Atualiza o display do relógio
    };

    // Função para reduzir o tempo no timer
    const reduzirTempo = (taskId) => {
        if (tempo > 0) {
            tempo--;
            atualizarTimer();
        } else {
            audio.play(); // T toca um som quando o tempo acaba
            clearInterval(intervalo); // Para o intervalo
            setTimeout(() => {
                alert("O tempo acabou");
                currentTaskId = taskId;
                if (currentTaskId) {
                    const task = tasks.find(task => task.id === currentTaskId);
                    if (task) {
                        increaseTaskCycles(task.id); // Aumenta o contador de ciclos da tarefa
                    }
                }
                resetarTempo(); // Reseta o tempo
            }, 100);
        }
    };

    // Função para iniciar o timer
    const iniciarTempo = () => {
        if (!timerAtivo) {
            timerAtivo = true;
            intervalo = setInterval(() => reduzirTempo(currentTaskId), 1000); // Inicia o intervalo
        }
    };

    // Função para pausar o timer
    const pausarTempo = () => {
        if (timerAtivo) {
            timerAtivo = false;
            clearInterval(intervalo); // Para o intervalo
        }
    };

    // Função para resetar o timer
    const resetarTempo = () => {
        pausarTempo();
    
        if (pomo.classList.contains('dimmer')) {
            tempo = tempos.pomo;
        } else if (long.classList.contains('dimmer')) {
            tempo = tempos.long;
        } else if (rest.classList.contains('dimmer')) {
            tempo = tempos.rest;
        } else if (custom.classList.contains('dimmer')) {
            tempo = valorCustomizadoInicial; // Usa o valor inicial do tempo personalizado
        }
    
        atualizarTimer(); // Atualiza o display do relógio
    };

    // Função para alterar o estado dos botões de tempo
    const escurecerBotoes = (botaoAtivo) => {
        const botoes = [pomo, long, rest, custom];
        botoes.forEach(botao => {
            botao.classList.toggle('dimmer', botao === botaoAtivo);
            botao.classList.toggle('transparent', botao !== botaoAtivo);
        });
    };

    // Função para mudar a cor de fundo da página
    const mudarCorDeFundo = (cor) => {
        body.style.backgroundColor = cor;
    };

    // Adiciona event listeners para os botões de controle do timer
    iniciar.addEventListener('click', iniciarTempo);
    pausar.addEventListener('click', pausarTempo);
    resetar.addEventListener('click', resetarTempo);

    // Define os eventos de clique para os botões de Pomodoro, Longo e Descanso
    pomo.addEventListener('click', () => {
        tempo = tempos.pomo;
        escurecerBotoes(pomo);
        mudarCorDeFundo('#C55B9D');
        resetarTempo();
    });

    long.addEventListener('click', () => {
        tempo = tempos.long;
        escurecerBotoes(long);
        mudarCorDeFundo('#6B3D98');
        resetarTempo();
    });

    rest.addEventListener('click', () => {
        tempo = tempos.rest;
        escurecerBotoes(rest);
        mudarCorDeFundo('#FF7B7B');
        resetarTempo();
    });

    custom.addEventListener('click', () => {
        tempo = tempos.custom;
        escurecerBotoes(custom);
        mudarCorDeFundo('#c5b0eb');
        resetarTempo();
    });

    // Define o evento para o botão de definir o timer personalizado
    setCustomTimer.addEventListener('click', () => {
        if (customMinutesInput.value !== '') {
            valorCustomizadoInicial = parseInt(customMinutesInput.value) * 60;
            tempos.custom = valorCustomizadoInicial;
            tempo = tempos.custom;
            customContainer.close();
            resetarTempo();
        }
    });

    // Adiciona o evento de submissão do formulário para adicionar tarefas
    taskForm.addEventListener('submit', adicionarTask);
});

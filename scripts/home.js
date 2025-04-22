document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const relogio = document.getElementById('relogio');
    const iniciarBtn = document.getElementById('Iniciar');
    const pausarBtn = document.getElementById('Pausar');
    const resetarBtn = document.getElementById('Resetar');
    const pomoBtn = document.getElementById('pomo');
    const longBtn = document.getElementById('long');
    const restBtn = document.getElementById('rest');
    const customBtn = document.getElementById('custom-minutes-button');
    const customDia = document.getElementById('custom-dia');
    const setCustomTimer = document.getElementById('set-custom-timer');
    const customMinutesInput = document.getElementById('custom-minutes');
    const audio = document.getElementById('audio');
    const increaseButton = document.getElementById("increase-cycles");
    const decreaseButton = document.getElementById("decrease-cycles");
    const cyclesInput = document.getElementById("task-cycles");
    const adicionarTarefaBtn = document.getElementById("adicionar-tarefa");
    const fecharMenuBtn = document.getElementById("fechar-menu");
    const menuDialog = document.getElementById("menu-dialog");
    const cancelarBtn = document.getElementById("cancelar");

    // Timer presets
    const tempos = {
        pomo: 25 * 60,
        long: 10 * 60,
        rest: 5 * 60,
        custom: 0
    };

    // State variables
    let tempo = tempos.pomo;
    let intervalo;
    let timerAtivo = false;
    let tasks = [];
    let activeTaskIds = []; // Now stores multiple active task IDs
    let taskToEdit = null;

    // Timer functions
    const formatarTempo = (segundos) => {
        const horas = Math.floor(segundos / 3600);
        const minutos = Math.floor((segundos % 3600) / 60);
        const segundosRestantes = segundos % 60;
        return horas > 0
            ? `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`
            : `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
    };

    const atualizarTimer = () => {
        relogio.textContent = formatarTempo(tempo);
    };

    const reduzirTempo = () => {
        if (tempo > 0) {
            tempo--;
            atualizarTimer();
            
            if (tempo <= 10) relogio.classList.add('pulse');
            
            if (tempo === 0) {
                clearInterval(intervalo);
                timerAtivo = false;
                audio.play();
                relogio.classList.remove('pulse');
                
                // Update all active tasks
                activeTaskIds.forEach(taskId => {
                    const task = tasks.find(t => t.id === taskId);
                    if (task) {
                        task.completedCycles++;
                        if (task.completedCycles >= task.totalCycles) {
                            task.completed = true;
                            const taskElement = document.querySelector(`.task-item[data-id="${task.id}"]`);
                            if (taskElement) {
                                taskElement.classList.add('completed', 'celebrate');
                                setTimeout(() => taskElement.classList.remove('celebrate'), 2000);
                            }
                        }
                    }
                });
                
                salvarTasks();
                renderizarTasks();
                resetarTempo();
            }
        }
    };

    const iniciarTempo = () => {
        if (!timerAtivo && activeTaskIds.length > 0) {
            timerAtivo = true;
            intervalo = setInterval(reduzirTempo, 1000);
            iniciarBtn.disabled = true;
            pausarBtn.disabled = false;
        } else if (!timerAtivo) {
            alert('Selecione pelo menos uma tarefa antes de iniciar o timer!');
        }
    };

    const pausarTempo = () => {
        if (timerAtivo) {
            clearInterval(intervalo);
            timerAtivo = false;
            iniciarBtn.disabled = false;
            pausarBtn.disabled = true;
        }
    };

    const resetarTempo = () => {
        pausarTempo();
        
        if (pomoBtn.classList.contains('dimmer')) {
            tempo = tempos.pomo;
        } else if (longBtn.classList.contains('dimmer')) {
            tempo = tempos.long;
        } else if (restBtn.classList.contains('dimmer')) {
            tempo = tempos.rest;
        } else if (customBtn.classList.contains('dimmer')) {
            tempo = tempos.custom;
        }
        
        atualizarTimer();
        iniciarBtn.disabled = false;
        pausarBtn.disabled = true;
    };

    const escurecerBotoes = (botaoAtivo) => {
        [pomoBtn, longBtn, restBtn, customBtn].forEach(botao => {
            botao.classList.toggle('dimmer', botao === botaoAtivo);
            botao.classList.toggle('transparent', botao !== botaoAtivo);
        });
    };

    // Task functions
    const salvarTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const carregarTasks = () => {
        const tasksSalvas = localStorage.getItem('tasks');
        if (tasksSalvas) {
            tasks = JSON.parse(tasksSalvas);
            renderizarTasks();
        }
    };

    const renderizarTasks = () => {
        taskList.innerHTML = '';
        
        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item');
            taskItem.dataset.id = task.id;
            
            if (activeTaskIds.includes(task.id)) {
                taskItem.classList.add('active');
            }
            
            if (task.completedCycles >= task.totalCycles) {
                taskItem.classList.add('completed');
                task.completed = true;
            }
            
            taskItem.innerHTML = `
                <div class="taskItem">
                    <h2>${task.title}</h2>
                    <p>${task.desc}</p>
                    <p>Ciclos concluídos: ${task.completedCycles}/${task.totalCycles}</p>
                    <div class='task-buttons'>
                        <button class="edit-btn" data-id="${task.id}">Editar</button>
                        <button class="delete-btn" data-id="${task.id}">Excluir</button>
                        <button class="complete-btn" data-id="${task.id}">
                            ${task.completed ? 'Incompleto' : 'Completo'}
                        </button>
                        <button class="toggle-active-btn" data-id="${task.id}">
                            ${activeTaskIds.includes(task.id) ? 'Desativar' : 'Ativar'}
                        </button>
                    </div>
                </div>`;
            taskList.appendChild(taskItem);
        });
    };

    const adicionarTask = (event) => {
        event.preventDefault();

        const taskTitle = document.getElementById('task-title').value.trim();
        const taskDesc = document.getElementById('task-desc').value.trim();
        const cyclesValue = parseInt(cyclesInput.value, 10);

        if (!taskTitle || !taskDesc || isNaN(cyclesValue) || cyclesValue < 1) {
            alert('Preencha todos os campos corretamente!');
            return;
        }

        if (taskToEdit) {
            const taskIndex = tasks.findIndex(task => task.id === taskToEdit.id);
            if (taskIndex !== -1) {
                tasks[taskIndex] = {
                    ...tasks[taskIndex],
                    title: taskTitle,
                    desc: taskDesc,
                    totalCycles: cyclesValue
                };
            }
            taskToEdit = null;
        } else {
            tasks.push({
                id: Date.now(),
                title: taskTitle,
                desc: taskDesc,
                completed: false,
                totalCycles: cyclesValue,
                completedCycles: 0
            });
        }

        document.getElementById('task-title').value = '';
        document.getElementById('task-desc').value = '';
        cyclesInput.value = '1';

        salvarTasks();
        renderizarTasks();
        menuDialog.close();
    };

    const handleTaskAction = (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        
        const taskId = parseInt(btn.dataset.id);
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        if (btn.classList.contains('delete-btn')) {
            tasks = tasks.filter(t => t.id !== taskId);
            activeTaskIds = activeTaskIds.filter(id => id !== taskId);
            if (activeTaskIds.length === 0) pausarTempo();
        } 
        else if (btn.classList.contains('edit-btn')) {
            taskToEdit = task;
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-desc').value = task.desc;
            cyclesInput.value = task.totalCycles;
            menuDialog.showModal();
        } 
        else if (btn.classList.contains('complete-btn')) {
            task.completed = !task.completed;
            task.completedCycles = task.completed ? task.totalCycles : 0;
            if (task.completed) {
                activeTaskIds = activeTaskIds.filter(id => id !== taskId);
            }
        } 
        else if (btn.classList.contains('toggle-active-btn')) {
            const index = activeTaskIds.indexOf(taskId);
            if (index === -1) {
                // Activate task
                activeTaskIds.push(taskId);
            } else {
                // Deactivate task
                activeTaskIds.splice(index, 1);
            }
        
        }

        salvarTasks();
        renderizarTasks();
    };

    // Event listeners
    taskForm.addEventListener('submit', adicionarTask);
    taskList.addEventListener('click', handleTaskAction);
    iniciarBtn.addEventListener('click', iniciarTempo);
    pausarBtn.addEventListener('click', pausarTempo);
    resetarBtn.addEventListener('click', resetarTempo);
    
    pomoBtn.addEventListener('click', () => {
        tempo = tempos.pomo;
        escurecerBotoes(pomoBtn);
        resetarTempo();
    });

    longBtn.addEventListener('click', () => {
        tempo = tempos.long;
        escurecerBotoes(longBtn);
        resetarTempo();
    });

    restBtn.addEventListener('click', () => {
        tempo = tempos.rest;
        escurecerBotoes(restBtn);
        resetarTempo();
    });

    customBtn.addEventListener('click', () => {
        customDia.showModal();
    });

    setCustomTimer.addEventListener('click', () => {
        const customValue = parseInt(customMinutesInput.value, 10);
        
        if (isNaN(customValue)) {
            alert("Por favor, insira um valor válido.");
            return;
        }

        if (customValue <= 0) {
            alert("O tempo deve ser maior que zero.");
            return;
        }

        if (customValue > 120) {
            alert("O tempo máximo é de 120 minutos.");
            return;
        }

        tempos.custom = customValue * 60;
        tempo = tempos.custom;
        escurecerBotoes(customBtn);
        atualizarTimer();
        customDia.close();
    });

    increaseButton.addEventListener("click", () => {
        let currentValue = parseInt(cyclesInput.value, 10) || 1;
        cyclesInput.value = currentValue + 1;
    });

    decreaseButton.addEventListener("click", () => {
        let currentValue = parseInt(cyclesInput.value, 10) || 1;
        if (currentValue > 1) {
            cyclesInput.value = currentValue - 1;
        }
    });

    adicionarTarefaBtn.addEventListener("click", () => {
        taskToEdit = null;
        document.getElementById('task-title').value = '';
        document.getElementById('task-desc').value = '';
        cyclesInput.value = '1';
        menuDialog.showModal();
    });

    fecharMenuBtn.addEventListener("click", () => {
        menuDialog.close();
    });

    cancelarBtn.addEventListener("click", () => {
        customDia.close();
    });

    // Initialization
    carregarTasks();
    atualizarTimer();
    escurecerBotoes(pomoBtn);
    pausarBtn.disabled = true;
});
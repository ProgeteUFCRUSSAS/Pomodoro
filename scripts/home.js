document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');

    const tempos = {
        pomo: 25 * 60,  // Tempo para Pomodoro
        long: 10 * 60,  // Tempo para Pausa Longa
        rest: 5 * 60    // Tempo para Pausa Curta
    };

    let tempo = tempos.pomo;
    let intervalo;
    let timerAtivo = false;
    let tasks = [];

    const relogio = document.getElementById('relogio');
    const iniciar = document.getElementById('Iniciar');
    const pausar = document.getElementById('Pausar');
    const resetar = document.getElementById('Resetar');
    const pomo = document.getElementById('pomo');
    const long = document.getElementById('long');
    const rest = document.getElementById('rest');
    const audio = document.getElementById('audio');
    const body = document.body;

    const images = [
        'path/to/image1.png',
        'path/to/image2.png',
        'path/to/image3.png'
    ];

    const formatarTempo = (segundos) => {
        const minutos = Math.floor(segundos / 60);
        const segundosRestantes = segundos % 60;
        return `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
    };

    const atualizarTimer = () => {
        relogio.textContent = formatarTempo(tempo);
    };

    const reduzirTempo = () => {
        if (tempo > 0) {
            tempo--;
            atualizarTimer();
        } else {
            audio.play();
            clearInterval(intervalo);

            setTimeout(() => {
                alert("O tempo acabou");
            }, 100);
        }
    };

    const iniciarTempo = () => {
        if (!timerAtivo) {
            timerAtivo = true;
            intervalo = setInterval(reduzirTempo, 1000);
        }
    };

    const pausarTempo = () => {
        if (timerAtivo) {
            timerAtivo = false;
            clearInterval(intervalo);
        }
    };

    const resetarTempo = () => {
        pausarTempo();
        if (pomo.classList.contains('dimmer')) {
            tempo = tempos.pomo;
        } else if (long.classList.contains('dimmer')) {
            tempo = tempos.long;
        } else if (rest.classList.contains('dimmer')) {
            tempo = tempos.rest;
        }
        atualizarTimer();
    };

    const escurecerBotoes = (botaoAtivo) => {
        const botoes = [pomo, long, rest];
        botoes.forEach(botao => {
            if (botao === botaoAtivo) {
                botao.classList.add('dimmer');
                botao.classList.remove('transparent');
            } else {
                botao.classList.add('transparent');
                botao.classList.remove('dimmer');
            }
        });
    };

    const mudarCorDeFundo = (cor) => {
        body.style.backgroundColor = cor;
    };

    iniciar.addEventListener('click', iniciarTempo);
    pausar.addEventListener('click', pausarTempo);
    resetar.addEventListener('click', resetarTempo);

    pomo.addEventListener('click', () => {
        tempo = tempos.pomo;
        escurecerBotoes(pomo);
        mudarCorDeFundo('#C55B9D');
        resetarTempo();
        iniciarTempo();
    });

    long.addEventListener('click', () => {
        tempo = tempos.long;
        escurecerBotoes(long);
        mudarCorDeFundo('#4E3F91');
        resetarTempo();
        iniciarTempo();
    });

    rest.addEventListener('click', () => {
        tempo = tempos.rest;
        escurecerBotoes(rest);
        mudarCorDeFundo('#6495CB');
        resetarTempo();
        iniciarTempo();
    });

    function getRandomImage() {
        const imagerand = Math.floor(Math.random() * images.length);
        return images[imagerand];
    }

    function renderTasks() {
        taskList.innerHTML = '';

        tasks.forEach((task, index) => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.style.backgroundImage = `url(${task.image})`;

            taskItem.innerHTML = `
                <p ${task.completed ? 'class="completed"' : ''}>${task.title}: ${task.desc}</p>
                <div>
                    <button class="edit-btn" onclick="editTask(${index})">Editar</button>
                    <button onclick="deleteTask(${index})">Excluir</button>
                    <button class="complete-btn" onclick="toggleComplete(${index})">${task.completed ? 'Desmarcar' : 'Completar'}</button>
                </div>
            `;
            taskList.appendChild(taskItem);
        });
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    function loadTasks() {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
            renderTasks();
        }
    }

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('task-title').value;
        const desc = document.getElementById('task-desc').value;

        if (title && desc) {
            tasks.push({
                title,
                desc,
                completed: false,
                image: getRandomImage()
            });
            renderTasks();
            saveTasks(); // Salva as tarefas no localStorage
            taskForm.reset();
        }
    });

    window.editTask = function(index) {
        const task = tasks[index];
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-desc').value = task.desc;
        tasks.splice(index, 1); // Remove a tarefa para edição
        renderTasks();
        saveTasks(); // Salva as tarefas no localStorage
    };

    window.deleteTask = function(index) {
        tasks.splice(index, 1);
        renderTasks();
        saveTasks(); // Salva as tarefas no localStorage
    };

    window.toggleComplete = function(index) {
        tasks[index].completed = !tasks[index].completed;
        renderTasks();
        saveTasks(); // Salva as tarefas no localStorage
    };

    atualizarTimer();
    loadTasks();
});

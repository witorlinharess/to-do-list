document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');

    // Array para armazenar as tarefas temporariamente
    let tasks = [];

    // Função para renderizar as tarefas na tela
    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `bg-gray-50 p-4 rounded-lg shadow-sm flex justify-between items-center transition ${task.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <span class="text-gray-800 flex-grow">${task.text}</span>
                <div class="space-x-2">
                    <button class="complete-btn bg-green-500 text-white text-xs px-2 py-1 rounded-md hover:bg-green-600 transition" data-index="${index}">
                        ✓
                    </button>
                    <button class="delete-btn bg-red-500 text-white text-xs px-2 py-1 rounded-md hover:bg-red-600 transition" data-index="${index}">
                        ✕
                    </button>
                </div>
            `;
            
            taskList.appendChild(li);
        });

        // Adiciona eventos aos botões
        document.querySelectorAll('.complete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                tasks[index].completed = !tasks[index].completed;
                renderTasks();
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                tasks.splice(index, 1);
                renderTasks();
            });
        });
    }

    // Adiciona uma nova tarefa
    addTaskBtn.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        if (taskText) {
            const newTask = {
                text: taskText,
                completed: false
            };
            tasks.push(newTask);
            renderTasks();
            taskInput.value = '';
        }
    });

    // Adiciona tarefa ao pressionar "Enter"
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTaskBtn.click();
        }
    });

    renderTasks();
});

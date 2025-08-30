const API_URL = 'http://localhost:3000/tasks';

document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');

    async function fetchAndRenderTasks() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Erro na rede: ${response.status}`);
            }
            const tasks = await response.json();
            
            taskList.innerHTML = '';
            tasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `bg-white p-4 rounded-lg shadow-sm flex justify-between items-center transition ${task.completed ? 'opacity-50 line-through' : ''}`;
                
                li.innerHTML = `
                    <span class="text-gray-800 flex-grow">${task.text}</span>
                    <div class="space-x-2">
                        <button class="complete-btn bg-green-500 text-white text-xs px-2 py-1 rounded-md hover:bg-green-600 transition" data-id="${task.id}">
                            ✓
                        </button>
                        <button class="delete-btn bg-red-500 text-white text-xs px-2 py-1 rounded-md hover:bg-red-600 transition" data-id="${task.id}">
                            ✕
                        </button>
                    </div>
                `;
                
                taskList.appendChild(li);
            });
        } catch (error) {
            console.error('Erro ao buscar tarefas:', error);
            taskList.innerHTML = `<li class="text-red-500 text-center">Não foi possível carregar as tarefas. Verifique se o servidor está rodando.</li>`;
        }
    }

    addTaskBtn.addEventListener('click', async () => {
        const taskText = taskInput.value.trim();
        if (taskText) {
            const newTask = {
                text: taskText,
                completed: false
            };
            
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newTask)
                });

                if (!response.ok) {
                    throw new Error(`Erro ao adicionar a tarefa: ${response.status}`);
                }
                
                taskInput.value = '';
                await fetchAndRenderTasks();
            } catch (error) {
                console.error('Erro ao adicionar tarefa:', error);
            }
        }
    });

    taskList.addEventListener('click', async (e) => {
        const taskId = e.target.getAttribute('data-id');
        if (!taskId) return;

        if (e.target.classList.contains('delete-btn')) {
            try {
                const response = await fetch(`${API_URL}/${taskId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    throw new Error(`Erro ao deletar tarefa: ${response.status}`);
                }
                await fetchAndRenderTasks();
            } catch (error) {
                console.error('Erro ao deletar tarefa:', error);
            }
        } else if (e.target.classList.contains('complete-btn')) {
            try {
                // Buscando a tarefa para inverter o status
                const tasks = await (await fetch(API_URL)).json();
                const taskToUpdate = tasks.find(task => task.id === taskId);
                
                if (!taskToUpdate) {
                    console.error('Tarefa não encontrada para atualizar.');
                    return;
                }

                taskToUpdate.completed = !taskToUpdate.completed;
                
                const response = await fetch(`${API_URL}/${taskId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(taskToUpdate)
                });

                if (!response.ok) {
                    throw new Error(`Erro ao atualizar tarefa: ${response.status}`);
                }
                await fetchAndRenderTasks();
            } catch (error) {
                console.error('Erro ao atualizar tarefa:', error);
            }
        }
    });

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTaskBtn.click();
        }
    });

    fetchAndRenderTasks();
});

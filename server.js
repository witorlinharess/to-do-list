const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importa o pacote CORS
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const TASKS_FILE = path.join(__dirname, 'tasks.json');

app.use(cors()); // Usa o CORS para permitir requisições do frontend
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '.')));

// Variável para armazenar as tarefas em memória
let tasks = [];

// Função para carregar as tarefas do arquivo JSON
function loadTasks() {
    try {
        const data = fs.readFileSync(TASKS_FILE, 'utf8');
        tasks = JSON.parse(data);
        console.log('Tarefas carregadas com sucesso.');
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Se o arquivo não existir, inicia com uma lista vazia
            console.log('Nenhum arquivo de tarefas encontrado. Iniciando com uma lista vazia.');
            tasks = [];
        } else {
            console.error('Erro ao ler o arquivo de tarefas:', error);
        }
    }
}

// Função para salvar as tarefas no arquivo JSON
function saveTasks() {
    try {
        const data = JSON.stringify(tasks, null, 2);
        fs.writeFileSync(TASKS_FILE, data, 'utf8');
        console.log('Tarefas salvas com sucesso.');
    } catch (error) {
        console.error('Erro ao salvar o arquivo de tarefas:', error);
    }
}

// Carrega as tarefas ao iniciar o servidor
loadTasks();

// Rota para obter todas as tarefas
app.get('/tasks', (req, res) => {
    res.json(tasks);
});

// Rota para adicionar uma nova tarefa
app.post('/tasks', (req, res) => {
    const newTask = {
        id: Date.now().toString(),
        text: req.body.text,
        completed: false
    };
    tasks.push(newTask);
    saveTasks();
    res.status(201).json(newTask);
});

// Rota para deletar uma tarefa
app.delete('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    res.status(204).send(); // 204 No Content
});

// Rota para atualizar uma tarefa (marcar como completa)
app.put('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex > -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        res.json(tasks[taskIndex]);
    } else {
        res.status(404).send('Tarefa não encontrada.');
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Importa o módulo 'fs' (File System) para interagir com arquivos.
// O 'fs' é nativo do Node.js, então não precisa ser instalado.
const fs = require('fs');

// Cria um array vazio para armazenar as tarefas.
// Vamos carregar as tarefas do arquivo JSON no início.
let tasks = [];

// Nome do arquivo onde as tarefas serão salvas.
const TASKS_FILE = 'tasks.json';

// Função para carregar as tarefas do arquivo JSON.
// Esta função é executada quando o servidor é iniciado.
function loadTasks() {
  try {
    // Tenta ler o conteúdo do arquivo.
    const data = fs.readFileSync(TASKS_FILE, 'utf8');
    // Faz o parse do JSON para o array de tarefas.
    tasks = JSON.parse(data);
    console.log('Tarefas carregadas com sucesso.');
  } catch (error) {
    // Se o arquivo não existir ou houver um erro, exibe uma mensagem.
    console.log('Nenhum arquivo de tarefas encontrado. Iniciando com uma lista vazia.');
    tasks = [];
  }
}

// Função para salvar as tarefas no arquivo JSON.
// Esta função é chamada sempre que uma tarefa é adicionada, removida ou alterada.
function saveTasks() {
  // Converte o array de tarefas para uma string JSON.
  const data = JSON.stringify(tasks, null, 2);
  // Salva a string no arquivo.
  fs.writeFileSync(TASKS_FILE, data, 'utf8');
  console.log('Tarefas salvas com sucesso.');
}

// Carrega as tarefas no início.
loadTasks();

// --- Agora, vamos criar um servidor HTTP simples ---
// Importa o módulo 'http' nativo do Node.js.
const http = require('http');

const server = http.createServer((req, res) => {
  // Define o cabeçalho de resposta para permitir CORS (Compartilhamento de Recursos de Origem Cruzada).
  // Isso é necessário para que o frontend, que está em uma origem diferente, possa se comunicar com este servidor.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Roteamento: Lida com diferentes URLs e métodos HTTP.
  if (req.url === '/tasks' && req.method === 'GET') {
    // Rota para obter todas as tarefas.
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(tasks));

  } else if (req.url === '/tasks' && req.method === 'POST') {
    // Rota para adicionar uma nova tarefa.
    let body = '';
    req.on('data', chunk => {
      // Recebe os dados do corpo da requisição.
      body += chunk.toString();
    });
    req.on('end', () => {
      // Quando a requisição termina, processa os dados.
      const newTask = JSON.parse(body);
      tasks.push(newTask);
      saveTasks(); // Salva a nova tarefa no arquivo.

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newTask));
    });

  } else if (req.url.startsWith('/tasks/') && req.method === 'DELETE') {
    // Rota para deletar uma tarefa.
    // Extrai o ID da tarefa da URL.
    const taskId = req.url.split('/')[2];
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Tarefa deletada com sucesso.' }));
  
  } else if (req.url.startsWith('/tasks/') && req.method === 'PUT') {
    // Rota para atualizar uma tarefa (marcar como concluída, por exemplo).
    const taskId = req.url.split('/')[2];
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const updatedTask = JSON.parse(body);
      tasks = tasks.map(task => task.id === taskId ? { ...task, ...updatedTask } : task);
      saveTasks();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(updatedTask));
    });
  
  } else if (req.url === '/') {
    // Rota raiz, para servir o frontend.
    fs.readFile('index.html', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Erro interno do servidor.');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else {
    // Se a rota não for encontrada.
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Página não encontrada.');
  }
});

// Define a porta em que o servidor irá escutar as requisições.
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

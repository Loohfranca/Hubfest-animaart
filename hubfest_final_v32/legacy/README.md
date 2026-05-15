# HubFest - Sistema de Gestão de Eventos

HubFest é uma aplicação web moderna para gerenciamento de festas infantis.

## 🚀 Como Rodar o Projeto

Este é um projeto estático (HTML, CSS, JS), o que torna a execução muito simples.

### Opção 1: Simples (Navegador)
Basta abrir o arquivo `index.html` diretamente no seu navegador favorito (Chrome, Firefox, Edge).

### Opção 2: Servidor Local (Recomendado)
Para uma melhor experiência (e evitar bloqueios de segurança de alguns navegadores), rode um servidor local.

Se você tem **Node.js** instalado:
```bash
npx serve .
```

Se você tem **Python** instalado:
```bash
python -m http.server
```

Acesse `http://localhost:3000` (ou 8000).

## 📂 Estrutura de Arquivos
*   `index.html`: Estrutura principal da aplicação.
*   `css/style.css`: Estilização (Tema Dark Glassmorphism).
*   `js/`:
    *   `script.js`: Lógica da interface, navegação e eventos.
    *   `data.js`: Camada de dados e persistência (LocalStorage).

## 🛠️ Tecnologias
*   HTML5
*   CSS3 (Variables, Flexbox, Grid)
*   JavaScript (ES6+)
*   Feather Icons
*   LocalStorage (Banco de dados no navegador)

## 📦 Deploy
Para colocar online, você pode usar serviços gratuitos para sites estáticos:
*   **Vercel / Netlify**: Basta arrastar a pasta do projeto para o dashboard deles.
*   **GitHub Pages**: Suba o código para um repositório e ative o Pages.

## 📝 Variáveis de Ambiente
Veja `.env.example` para configurações opcionais se for integrar com backends futuros.

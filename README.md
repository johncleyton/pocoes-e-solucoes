# Poções e Soluções — Loja da Merigold

Website de vendas da loja **Poções e Soluções**, de propriedade de Annabelle Merigold, localizada no Beco da Última Saída.

## Tecnologias

- **Backend**: Node.js + Express
- **Banco de Dados**: SQLite em memória via Sequelize
- **Frontend**: HTML, CSS e JavaScript (Vanilla)

## Configuração e Execução

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v14 ou superior)
- npm (incluso com Node.js)

### Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd LojaPocoes

# Instale as dependências
npm install
```

### Executando

```bash
npm start
```

O servidor será iniciado em **http://localhost:3000**.

- **Loja (cliente)**: http://localhost:3000
- **Administração**: http://localhost:3000/admin.html

### Banco de Dados

O banco SQLite roda **em memória** — os dados são recarregados com poções de exemplo a cada reinício do servidor.

## Estrutura do Projeto

```
LojaPocoes/
├── server.js              # Servidor Express + API REST + Sequelize
├── package.json
├── README.md
└── public/                # Arquivos estáticos servidos pelo Express
    ├── index.html         # Página da loja (cliente)
    ├── admin.html         # Página de administração
    ├── css/
    │   ├── style.css      # Estilos gerais (dark theme, Gill Sans)
    │   └── admin.css      # Estilos da página de administração
    └── js/
        ├── app.js         # JavaScript da loja (AJAX para listar poções)
        └── admin.js       # JavaScript do admin (CRUD via AJAX)
```

## API REST

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/pocoes` | Lista todas as poções |
| GET | `/api/pocoes/:id` | Busca poção por ID |
| POST | `/api/pocoes` | Cadastra nova poção |
| DELETE | `/api/pocoes/:id` | Remove uma poção |

### Campos da Poção

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `nome` | string | Sim |
| `descricao` | string | Sim |
| `imagem` | string (URL) | Não |
| `preco` | number | Sim |

## Autor

Desenvolvido para Annabelle Merigold — Poções e Soluções, desde 1867.

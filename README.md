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

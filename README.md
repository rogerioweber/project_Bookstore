# 📚 BookStore — Sistema de Gerenciamento de Livraria

Aplicação de linha de comando (CLI) para gerenciamento de acervo, clientes e empréstimos de uma livraria, desenvolvida em **TypeScript** com persistência em **PostgreSQL**.

---

## 🧱 Tecnologias utilizadas

| Tecnologia | Uso no projeto |
|---|---|
| **Node.js + TypeScript** | Linguagem e runtime da aplicação |
| **PostgreSQL 18** | Banco de dados relacional |
| **Docker / Docker Compose** | Ambiente isolado do banco de dados |
| **pg (node-postgres)** | Cliente PostgreSQL usado nas queries SQL |
| **Inquirer.js** | Construção dos menus e formulários interativos no terminal |
| **bcrypt** | Hash de senha dos funcionários |
| **ESLint + Prettier** | Padronização e qualidade de código |

---

## 🏗️ Arquitetura

O projeto segue uma **arquitetura em camadas**, separando responsabilidades para facilitar manutenção e leitura do código:

```
┌──────────────────────────────┐
│   MENUS / CONTROLLERS        │  → interação com o usuário (Inquirer)
├──────────────────────────────┤
│   SERVICES                   │  → regras de negócio e validações
├──────────────────────────────┤
│   REPOSITORIES               │  → acesso ao banco (SQL puro via pg)
├──────────────────────────────┤
│   POSTGRESQL                 │  → persistência dos dados
└──────────────────────────────┘
```

- **Controllers/Menus**: exibem opções, capturam entrada do usuário e delegam para os services. Não contêm regra de negócio nem SQL.
- **Services**: validam dados, aplicam regras de negócio (ex.: impedir empréstimo duplicado, checar duplicidade de cadastro) e orquestram chamadas aos repositories.
- **Repositories**: única camada que executa comandos SQL (`SELECT`, `INSERT`, `UPDATE`, `DELETE`), sempre com queries parametrizadas.
- **Models**: interfaces TypeScript que tipam as entidades do sistema.
- **Utils**: funções e helpers reaproveitáveis (prompts de terminal, normalização de texto, formatação de datas).

---

## 📁 Estrutura de pastas

```
Projeto Livraria/
├── src/
│   ├── controllers/        # Fluxos de interação (cadastro, consulta, detalhe, empréstimo...)
│   │   ├── autorController.ts
│   │   ├── clienteCadastrarController.ts
│   │   ├── clienteConsultarController.ts
│   │   ├── consultaPublicaController.ts
│   │   ├── emprestimoController.ts
│   │   ├── funcionarioCadastroController.ts
│   │   ├── funcionarioLoginController.ts
│   │   ├── livroCadastroController.ts
│   │   ├── livroConsultarController.ts
│   │   ├── livroDetalheController.ts
│   │   └── relatorioController.ts
│   │
│   ├── services/            # Regras de negócio e validações
│   │   ├── autorService.ts
│   │   ├── categoriaService.ts
│   │   ├── clienteService.ts
│   │   ├── funcionarioService.ts
│   │   ├── livroService.ts
│   │   └── reservaService.ts
│   │
│   ├── repositories/         # Acesso ao banco de dados (SQL puro via pg)
│   │   ├── autorRepository.ts
│   │   ├── categoriaRepository.ts
│   │   ├── clienteRepository.ts
│   │   ├── funcionarioRepository.ts
│   │   ├── livroRepository.ts
│   │   └── reservaRepository.ts
│   │
│   ├── models/                # Interfaces e tipos TypeScript
│   │   ├── Autor.ts
│   │   ├── Categoria.ts
│   │   ├── Cliente.ts
│   │   ├── Funcionario.ts
│   │   ├── Livro.ts
│   │   └── Reserva.ts
│   │
│   ├── menus/                  # Menus principais de navegação
│   │   ├── adminMenuController.ts
│   │   ├── loginMenuController.ts
│   │   └── menuInicial.ts
│   │
│   ├── infra/                   # Infraestrutura de acesso ao banco
│   │   └── database/
│   │       ├── connection.ts     # Conexão com o PostgreSQL
│   │       └── schema.sql        # Script de criação das tabelas
│   │
│   ├── utils/                     # Funções reutilizáveis
│   │   ├── data.ts                 # Formatação de datas (fuso horário do Brasil)
│   │   ├── fluxoConsulta.ts         # Fluxo genérico de listar/buscar/selecionar
│   │   ├── prompts.ts                # Helpers reutilizáveis do Inquirer
│   │   └── texto.ts                   # Normalização de texto (capitalizar, iniciais)
│   │
│   └── main.ts                          # Ponto de entrada da aplicação
│
├── docker/
│   └── docker-compose.yml                # Configuração do container PostgreSQL
│
├── .env                                    # Variáveis de ambiente (não versionado)
├── .gitignore
├── .prettierrc
├── eslint.config.mjs
├── package.json
├── README.md
└── tsconfig.json
```

---

## 🗃️ Modelo de dados

O banco é composto pelas seguintes entidades principais:

| Tabela | Descrição |
|---|---|
| `autor` | Autores dos livros |
| `categoria` | Categorias/gêneros literários |
| `livro` | Livros do acervo |
| `livro_autor` | Relação N:N entre livros e autores |
| `categoria_livro` | Relação N:N entre livros e categorias |
| `funcionario` | Usuários administradores do sistema (login) |
| `cliente` | Clientes que realizam empréstimos |
| `reserva_acervo` | Registro de empréstimos e devoluções |

Um livro pode ter **vários autores** e **várias categorias**, e um autor/categoria pode estar associado a **vários livros** — por isso o uso de tabelas intermediárias (`livro_autor`, `categoria_livro`).

---

## ⚙️ Funcionalidades

### Acesso público (sem login)
- Consultar se um livro existe no acervo e se está disponível para empréstimo (sem exibir quantidade de exemplares).

### Acesso administrativo (funcionário logado)
- **Autores**: cadastrar, consultar (listar todos / buscar por nome), atualizar, remover.
- **Livros**: cadastrar (com múltiplos autores e categorias), consultar (por título, autor, categoria ou listagem completa ordenável), atualizar, remover.
- **Clientes**: cadastrar, consultar (por nome ou CPF), atualizar, remover.
- **Empréstimos**: registrar novo empréstimo, registrar devolução, consultar histórico.
- **Relatórios**:
  - Livros disponíveis
  - Livros atualmente emprestados
  - Quantidade de livros por autor
  - Histórico de empréstimos por livro
  - Clientes com empréstimo ativo (com indicação de atraso)

---

## 🔐 Regras de negócio relevantes

- Um cliente não pode pegar um novo livro emprestado enquanto tiver outro empréstimo em aberto.
- Reservas com prazo de devolução vencido são automaticamente marcadas como **atrasadas**.
- Livros e clientes com **histórico de empréstimos** não podem ser excluídos fisicamente do banco (garantia de integridade referencial). Nesses casos:
  - O sistema impede a remoção enquanto houver empréstimo **ativo**.
  - Uma vez sem empréstimos ativos, o cliente pode ser removido: seus dados pessoais (nome, e-mail, telefone, CPF) são **anonimizados**, preservando apenas as iniciais do nome — assim o histórico de empréstimos continua íntegro sem expor dados pessoais.
- Nomes de autores, categorias e títulos de livros são tratados como duplicados independentemente de acentuação ou caixa (ex.: "ação", "Ação" e "AÇÃO" são o mesmo registro).

---

## 🧪 Recursos de TypeScript demonstrados

- **Interfaces**: tipagem de todas as entidades (`Autor`, `Livro`, `Cliente`, `Funcionario`, `Reserva`, etc.).
- **Classes**: `FuncionarioRepository`, com construtor, propriedades privadas e métodos públicos.
- **Modificadores de acesso**: uso de `private` e `public` na camada de repositório.
- **Parâmetros e retornos tipados**: em todas as funções `async`, com `Promise<T>` explícito.
- **Consultas SQL diretas** via biblioteca `pg`, incluindo `INSERT`, `UPDATE`, `DELETE`, `SELECT`.
- **Consultas relacionais**: uso de `INNER JOIN`, `LEFT JOIN`, `GROUP BY`, `ORDER BY`, `LIMIT` e funções de agregação (`COUNT`, `STRING_AGG`).

---

## 🚀 Como rodar o projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) (v18 ou superior)
- [Docker](https://www.docker.com/) e Docker Compose

### 1. Clone o repositório
```bash
git clone https://github.com/rogerioweber/project_Bookstore.git
cd Projeto-Livraria
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:
```dotenv
DB_HOST=localhost
DB_PORT=5434
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=bookstore
```

### 4. Suba o banco de dados
```bash
npm run db:up
```

### 5. Crie as tabelas
```bash
docker cp src/database/schema.sql bookstore-db:/schema.sql
docker exec -it bookstore-db psql -U postgres -d bookstore -f //schema.sql
```

### 6. Rode a aplicação
```bash
npm run dev
```

---

## 📜 Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia a aplicação em modo desenvolvimento (recarrega ao salvar) |
| `npm run db:up` | Sobe o container do PostgreSQL |
| `npm run db:down` | Encerra o container do PostgreSQL |

---

## 🧹 Padrões de código

- Lint com **ESLint** (modo `strictTypeChecked`) e formatação com **Prettier**.
- Arquivos sempre em **LF** (configurado via `.editorconfig` e `.gitattributes`) para evitar conflitos entre Windows e Linux.
- Organização de imports automática (`eslint-plugin-import`).

Para checar o projeto:
```bash
npx eslint .
```

---

## 🌳 Versionamento

O projeto segue o fluxo de branches:

```
main
develop
feat/autores
feat/livros
feat/clientes
feat/emprestimos
docs/readme
```

Cada funcionalidade é desenvolvida em uma branch própria a partir de `develop`, com merge posterior via Pull Request.

---

Desenvolvido por **Rogério Weber** como projeto acadêmico.

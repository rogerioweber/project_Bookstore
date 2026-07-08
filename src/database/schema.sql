-- =====================================================================
-- EXTENSÕES E FUNÇÕES AUXILIARES
-- =====================================================================CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION imutavel_unaccent(texto TEXT)
RETURNS TEXT AS $$
  SELECT public.unaccent(texto);
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE
SET search_path = public;

-- =====================================================================
-- TABELA: autor
-- =====================================================================
CREATE TABLE IF NOT EXISTS autor (
    id      SERIAL PRIMARY KEY,
    nome    VARCHAR(150) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_autor_nome_unico
ON autor (LOWER(imutavel_unaccent(nome)));

-- =====================================================================
-- TABELA: categoria
-- =====================================================================
CREATE TABLE IF NOT EXISTS categoria (
    id      SERIAL PRIMARY KEY,
    nome    VARCHAR(80) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_categoria_nome_unico
ON categoria (LOWER(imutavel_unaccent(nome)));

-- =====================================================================
-- TABELA: livro
-- =====================================================================
CREATE TABLE IF NOT EXISTS livro (
    id                  SERIAL PRIMARY KEY,
    titulo              VARCHAR(200) NOT NULL,
    total_exemplares    INTEGER NOT NULL DEFAULT 1 CHECK (total_exemplares >= 0),
    status              VARCHAR(20) NOT NULL DEFAULT 'disponivel'
                            CHECK (status IN ('disponivel', 'indisponivel'))
);

-- =====================================================================
-- TABELA: livro_autor
-- Relação N:N entre livro e autor (um livro pode ter vários autores
-- e um autor pode ter escrito vários livros)
-- Depende de: livro, autor
-- =====================================================================
CREATE TABLE IF NOT EXISTS livro_autor (
    livro_id    INTEGER NOT NULL REFERENCES livro(id)
                    ON DELETE CASCADE
                    ON UPDATE CASCADE,
    autor_id    INTEGER NOT NULL REFERENCES autor(id)
                    ON DELETE CASCADE
                    ON UPDATE CASCADE,

    PRIMARY KEY (livro_id, autor_id)
);

CREATE INDEX IF NOT EXISTS idx_livro_autor_autor_id ON livro_autor(autor_id);

-- =====================================================================
-- TABELA: categoria_livro
-- Relação N:N entre livro e categoria (um livro pode ter várias
-- categorias e uma categoria pode estar em vários livros)
-- Depende de: livro, categoria
-- =====================================================================
CREATE TABLE IF NOT EXISTS categoria_livro (
    livro_id      INTEGER NOT NULL REFERENCES livro(id)
                      ON DELETE CASCADE
                      ON UPDATE CASCADE,
    categoria_id  INTEGER NOT NULL REFERENCES categoria(id)
                      ON DELETE CASCADE
                      ON UPDATE CASCADE,

    PRIMARY KEY (livro_id, categoria_id)
);

CREATE INDEX IF NOT EXISTS idx_categoria_livro_categoria_id ON categoria_livro(categoria_id);

-- =====================================================================
-- TABELA: funcionario
-- Operador autorizado que executa as ações no sistema
-- =====================================================================
CREATE TABLE IF NOT EXISTS funcionario (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(100) NOT NULL,
    sobrenome   VARCHAR(100) NOT NULL,
    usuario       VARCHAR(25) NOT NULL,
    senha       VARCHAR(100) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_funcionario_usuario_unico
ON funcionario (LOWER(usuario));

-- =====================================================================
-- TABELA: cliente
-- Cliente da livraria que solicita reservas
-- =====================================================================
CREATE TABLE IF NOT EXISTS cliente (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(100) NOT NULL,
    sobrenome   VARCHAR(100) NOT NULL,
    cpf         VARCHAR(11) UNIQUE NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    telefone    VARCHAR(20) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cliente_email_unico
ON cliente (LOWER(email));

-- =====================================================================
-- TABELA: reserva_acervo
-- Registro de que um exemplar de um livro foi reservado por um
-- cliente, com o funcionário responsável pelo registro
-- Depende de: livro, funcionario, cliente
-- =====================================================================
CREATE TABLE IF NOT EXISTS reserva_acervo (
    id                          SERIAL PRIMARY KEY,
    livro_id                    INTEGER NOT NULL REFERENCES livro(id)
                                    ON DELETE RESTRICT
                                    ON UPDATE CASCADE,
    funcionario_id              INTEGER NOT NULL REFERENCES funcionario(id)
                                    ON DELETE RESTRICT
                                    ON UPDATE CASCADE,
    funcionario_devolucao_id    INTEGER REFERENCES funcionario(id)
                                    ON DELETE RESTRICT
                                    ON UPDATE CASCADE,
    cliente_id                  INTEGER NOT NULL REFERENCES cliente(id)
                                    ON DELETE RESTRICT
                                    ON UPDATE CASCADE,
    data_reserva                TIMESTAMP NOT NULL DEFAULT NOW(),
    data_prevista_devolucao     DATE NOT NULL,
    data_devolucao              TIMESTAMP,
    status                      VARCHAR(20) NOT NULL DEFAULT 'ativa'
                                    CHECK (status IN ('ativa', 'devolvida', 'atrasada')),

    CONSTRAINT chk_data_devolucao_apos_reserva
        CHECK (data_devolucao IS NULL OR data_devolucao >= data_reserva),
    CONSTRAINT chk_prevista_apos_reserva
        CHECK (data_prevista_devolucao >= data_reserva::date)
);

CREATE INDEX IF NOT EXISTS idx_reserva_livro_id ON reserva_acervo(livro_id);
CREATE INDEX IF NOT EXISTS idx_reserva_funcionario_id ON reserva_acervo(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_reserva_cliente_id ON reserva_acervo(cliente_id);
CREATE INDEX IF NOT EXISTS idx_reserva_status ON reserva_acervo(status);

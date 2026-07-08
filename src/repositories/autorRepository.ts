import { pool } from '../infra/database/connection'
import { Autor, AutorComQuantidadeLivros } from '../models/Autor'

async function buscarPorNome(nome: string): Promise<Autor | null> {
  const result = await pool.query<Autor>(
    'SELECT * FROM autor WHERE LOWER(imutavel_unaccent(nome)) = LOWER(imutavel_unaccent($1))',
    [nome]
  )
  return result.rows[0] ?? null
}

async function criar(nome: string): Promise<Autor> {
  const result = await pool.query<Autor>(
    'INSERT INTO autor (nome) VALUES ($1) RETURNING *',
    [nome]
  )
  return result.rows[0]
}

async function atualizar(id: number, nome: string): Promise<Autor> {
  const result = await pool.query<Autor>(
    'UPDATE autor SET nome = $1 WHERE id = $2 RETURNING *',
    [nome, id]
  )
  return result.rows[0]
}

async function listarComQuantidadeLivros(): Promise<
  AutorComQuantidadeLivros[]
> {
  const result = await pool.query<AutorComQuantidadeLivros>(
    `SELECT
       a.id AS autor_id,
       a.nome AS autor_nome,
       COUNT(la.livro_id)::int AS quantidade_livros
     FROM autor a
     LEFT JOIN livro_autor la ON la.autor_id = a.id
     GROUP BY a.id, a.nome
     ORDER BY a.nome`
  )
  return result.rows
}

async function contarLivrosVinculados(autorId: number): Promise<number> {
  const result = await pool.query<{ total: string }>(
    'SELECT COUNT(*)::int AS total FROM livro_autor WHERE autor_id = $1',
    [autorId]
  )
  return Number(result.rows[0].total)
}

async function deletar(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM autor WHERE id = $1', [id])
  return (result.rowCount ?? 0) > 0
}

async function buscarPorId(id: number): Promise<Autor | null> {
  const result = await pool.query<Autor>('SELECT * FROM autor WHERE id = $1', [
    id
  ])
  return result.rows[0] ?? null
}

async function listarTodos(): Promise<Autor[]> {
  const result = await pool.query<Autor>('SELECT * FROM autor ORDER BY nome')
  return result.rows
}

async function buscarPorNomeParcial(nome: string): Promise<Autor[]> {
  const result = await pool.query<Autor>(
    `SELECT * FROM autor
     WHERE imutavel_unaccent(nome) ILIKE imutavel_unaccent($1)
     ORDER BY nome`,
    [`%${nome}%`]
  )
  return result.rows
}

export {
  buscarPorNome,
  criar,
  atualizar,
  listarComQuantidadeLivros,
  contarLivrosVinculados,
  deletar,
  buscarPorId,
  listarTodos,
  buscarPorNomeParcial
}

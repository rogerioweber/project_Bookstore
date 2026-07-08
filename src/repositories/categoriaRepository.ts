import { pool } from '../infra/database/connection'
import { Categoria } from '../models/Categoria'

async function buscarPorNome(nome: string): Promise<Categoria | null> {
  const result = await pool.query<Categoria>(
    'SELECT * FROM categoria WHERE LOWER(imutavel_unaccent(nome)) = LOWER(imutavel_unaccent($1))',
    [nome]
  )
  return result.rows[0] ?? null
}

async function criar(nome: string): Promise<Categoria> {
  const result = await pool.query<Categoria>(
    'INSERT INTO categoria (nome) VALUES ($1) RETURNING *',
    [nome]
  )
  return result.rows[0]
}

async function listarTodos(): Promise<Categoria[]> {
  const result = await pool.query<Categoria>(
    'SELECT * FROM categoria ORDER BY nome'
  )
  return result.rows
}

export { buscarPorNome, criar, listarTodos }

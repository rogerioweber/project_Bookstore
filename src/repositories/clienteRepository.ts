import { pool } from '../database/connection'
import { Cliente } from '../models/Cliente'

async function buscarPorCpf(cpf: string): Promise<Cliente | null> {
  const result = await pool.query<Cliente>(
    'SELECT * FROM usuario WHERE cpf = $1',
    [cpf]
  )
  return result.rows[0] ?? null
}

async function buscarPorId(id: number): Promise<Cliente | null> {
  const result = await pool.query<Cliente>(
    'SELECT * FROM usuario WHERE id = $1',
    [id]
  )
  return result.rows[0] ?? null
}

async function listarTodos(): Promise<Cliente[]> {
  const result = await pool.query<Cliente>(
    'SELECT * FROM usuario ORDER BY nome'
  )
  return result.rows
}

async function criar(
  nome: string,
  sobrenome: string,
  cpf: string,
  email: string | null
): Promise<Cliente> {
  const result = await pool.query<Cliente>(
    `INSERT INTO usuario (nome, sobrenome, cpf, email)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [nome, sobrenome, cpf, email]
  )
  return result.rows[0]
}

export { buscarPorCpf, buscarPorId, listarTodos, criar }

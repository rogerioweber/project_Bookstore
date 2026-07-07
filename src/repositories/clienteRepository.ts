import { pool } from '../database/connection'
import { AtualizarClienteInput, Cliente } from '../models/Cliente'

async function buscarPorCpf(cpf: string): Promise<Cliente | null> {
  const result = await pool.query<Cliente>(
    'SELECT * FROM cliente WHERE cpf = $1',
    [cpf]
  )
  return result.rows[0] ?? null
}

async function buscarPorId(id: number): Promise<Cliente | null> {
  const result = await pool.query<Cliente>(
    'SELECT * FROM cliente WHERE id = $1',
    [id]
  )
  return result.rows[0] ?? null
}

async function listarTodos(): Promise<Cliente[]> {
  const result = await pool.query<Cliente>(
    'SELECT * FROM cliente ORDER BY nome'
  )
  return result.rows
}

async function criar(
  nome: string,
  sobrenome: string,
  cpf: string,
  email: string,
  telefone: string
): Promise<Cliente> {
  const result = await pool.query<Cliente>(
    `INSERT INTO cliente (nome, sobrenome, cpf, email, telefone)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [nome, sobrenome, cpf, email, telefone]
  )
  return result.rows[0]
}

async function buscarPorNomeParcial(nome: string): Promise<Cliente[]> {
  const result = await pool.query<Cliente>(
    `SELECT * FROM cliente
     WHERE (nome || ' ' || sobrenome) ILIKE $1
     ORDER BY nome`,
    [`%${nome}%`]
  )
  return result.rows
}

async function atualizar(
  id: number,
  dados: AtualizarClienteInput
): Promise<Cliente> {
  const result = await pool.query<Cliente>(
    `UPDATE cliente
     SET nome = $1, sobrenome = $2, email = $3, telefone = $4
     WHERE id = $5
     RETURNING *`,
    [dados.nome, dados.sobrenome, dados.email, dados.telefone, id]
  )
  return result.rows[0]
}

async function deletar(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM cliente WHERE id = $1', [id])
  return (result.rowCount ?? 0) > 0
}

export {
  buscarPorCpf,
  buscarPorId,
  listarTodos,
  criar,
  buscarPorNomeParcial,
  atualizar,
  deletar
}

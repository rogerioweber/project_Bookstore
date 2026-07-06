import bcrypt from 'bcrypt'

import { pool } from '../database/connection'
import { Funcionario } from '../models/Funcionario'

async function cadastrarFuncionario(
  nome: string,
  sobrenome: string,
  email: string,
  senha: string
): Promise<Funcionario> {
  const senhaHash = await bcrypt.hash(senha, 10)

  const result = await pool.query<Funcionario>(
    `INSERT INTO funcionario (nome, sobrenome, email, senha)
     VALUES ($1, $2, $3, $4)
     RETURNING id, nome, sobrenome, email, senha`,
    [nome, sobrenome, email, senhaHash]
  )

  return result.rows[0]
}

async function buscarFuncionarioPorEmail(
  email: string
): Promise<Funcionario | null> {
  const result = await pool.query<Funcionario>(
    `SELECT * FROM funcionario WHERE email = $1`,
    [email]
  )

  return result.rows[0] ?? null
}

async function autenticarFuncionario(
  email: string,
  senha: string
): Promise<Funcionario | null> {
  const funcionario = await buscarFuncionarioPorEmail(email)

  if (!funcionario) {
    return null
  }

  const senhaValida = await bcrypt.compare(senha, funcionario.senha)

  if (!senhaValida) {
    return null
  }

  return funcionario
}

export {
  cadastrarFuncionario,
  buscarFuncionarioPorEmail,
  autenticarFuncionario
}

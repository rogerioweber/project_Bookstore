// src/repositories/FuncionarioRepository.ts
import { pool } from '../database/connection'
import { Funcionario } from '../models/Funcionario'

export class FuncionarioRepository {
  async criar(
    nome: string,
    sobrenome: string,
    email: string,
    senhaHash: string
  ): Promise<Funcionario> {
    const result = await pool.query<Funcionario>(
      `INSERT INTO funcionario (nome, sobrenome, email, senha)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, sobrenome, email, senha`,
      [nome, sobrenome, email, senhaHash]
    )
    return result.rows[0]
  }

  async buscarPorEmail(email: string): Promise<Funcionario | null> {
    const result = await pool.query<Funcionario>(
      `SELECT * FROM funcionario WHERE email = $1`,
      [email]
    )
    return result.rows[0] ?? null
  }
}

export const funcionarioRepository = new FuncionarioRepository()

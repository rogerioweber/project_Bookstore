import { Pool } from 'pg'

import { pool } from '../infra/database/connection'
import { Funcionario } from '../models/Funcionario'

export class FuncionarioRepository {
  private readonly conexao: Pool

  constructor(conexao: Pool = pool) {
    this.conexao = conexao
  }

  public async criar(
    nome: string,
    sobrenome: string,
    usuario: string,
    senhaHash: string
  ): Promise<Funcionario> {
    const result = await this.conexao.query<Funcionario>(
      `INSERT INTO funcionario (nome, sobrenome, usuario, senha)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, sobrenome, usuario, senha`,
      [nome, sobrenome, usuario, senhaHash]
    )
    return result.rows[0]
  }

  public async buscarPorUsuario(usuario: string): Promise<Funcionario | null> {
    const result = await this.conexao.query<Funcionario>(
      `SELECT * FROM funcionario WHERE usuario = $1`,
      [usuario]
    )
    return result.rows[0] ?? null
  }
}

export const funcionarioRepository = new FuncionarioRepository()

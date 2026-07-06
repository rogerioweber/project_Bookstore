// src/repositories/AutorRepository.ts
import { pool } from '../database/connection'
import { Autor } from '../models/Autor'

async function buscarPorNome(nome: string): Promise<Autor | null> {
  const result = await pool.query<Autor>(
    'SELECT * FROM autor WHERE LOWER(nome) = LOWER($1)',
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

export { buscarPorNome, criar }

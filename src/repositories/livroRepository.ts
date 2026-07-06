import { pool } from '../database/connection'
import { Livro } from '../models/Livro'

interface CriarLivroInput {
  titulo: string
  totalExemplares: number
  autorIds: number[]
  categoriaIds: number[]
}

async function buscarPorTitulo(titulo: string): Promise<Livro | null> {
  const result = await pool.query<Livro>(
    'SELECT * FROM livro WHERE LOWER(titulo) = LOWER($1)',
    [titulo]
  )
  return result.rows[0] ?? null
}

async function criar(dados: CriarLivroInput): Promise<Livro> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const livroResult = await client.query<Livro>(
      `INSERT INTO livro (titulo, total_exemplares)
       VALUES ($1, $2)
       RETURNING *`,
      [dados.titulo, dados.totalExemplares]
    )

    const livro = livroResult.rows[0]

    for (const autorId of dados.autorIds) {
      await client.query(
        'INSERT INTO livro_autor (livro_id, autor_id) VALUES ($1, $2)',
        [livro.id, autorId]
      )
    }

    for (const categoriaId of dados.categoriaIds) {
      await client.query(
        'INSERT INTO categoria_livro (livro_id, categoria_id) VALUES ($1, $2)',
        [livro.id, categoriaId]
      )
    }

    await client.query('COMMIT')
    return livro
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export { buscarPorTitulo, criar }

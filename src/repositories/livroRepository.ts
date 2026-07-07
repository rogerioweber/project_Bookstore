import { pool } from '../database/connection'
import {
  Livro,
  LivroListagem,
  LivroDetalhado,
  OrdenarLivrosPor,
  AtualizarLivroInput
} from '../models/Livro'

interface CriarLivroInput {
  titulo: string
  totalExemplares: number
  autorIds: number[]
  categoriaIds: number[]
}

function colunaOrdenacao(ordenarPor: OrdenarLivrosPor): string {
  if (ordenarPor === 'autor') return 'MIN(a.nome)'
  if (ordenarPor === 'categoria') return 'MIN(c.nome)'
  return 'l.titulo'
}

async function listarTodos(
  ordenarPor: OrdenarLivrosPor = 'titulo'
): Promise<LivroListagem[]> {
  const ordenacao = colunaOrdenacao(ordenarPor)

  const result = await pool.query<LivroListagem>(
    `SELECT
       l.id,
       l.titulo,
       l.total_exemplares,
       l.status,
       STRING_AGG(DISTINCT a.nome, ', ' ORDER BY a.nome) AS autores,
       STRING_AGG(DISTINCT c.nome, ', ' ORDER BY c.nome) AS categorias
     FROM livro l
     LEFT JOIN livro_autor la ON la.livro_id = l.id
     LEFT JOIN autor a ON a.id = la.autor_id
     LEFT JOIN categoria_livro cl ON cl.livro_id = l.id
     LEFT JOIN categoria c ON c.id = cl.categoria_id
     GROUP BY l.id
     ORDER BY ${ordenacao}`
  )

  return result.rows
}

async function listarPorAutor(nomeAutor: string): Promise<LivroListagem[]> {
  const result = await pool.query<LivroListagem>(
    `SELECT
       l.id,
       l.titulo,
       l.total_exemplares,
       l.status,
       STRING_AGG(DISTINCT a.nome, ', ' ORDER BY a.nome) AS autores,
       STRING_AGG(DISTINCT c.nome, ', ' ORDER BY c.nome) AS categorias
     FROM livro l
     INNER JOIN livro_autor la ON la.livro_id = l.id
     INNER JOIN autor a ON a.id = la.autor_id
     LEFT JOIN categoria_livro cl ON cl.livro_id = l.id
     LEFT JOIN categoria c ON c.id = cl.categoria_id
     WHERE l.id IN (
       SELECT la2.livro_id FROM livro_autor la2
       INNER JOIN autor a2 ON a2.id = la2.autor_id
       WHERE LOWER(a2.nome) = LOWER($1)
     )
     GROUP BY l.id
     ORDER BY l.titulo`,
    [nomeAutor]
  )

  return result.rows
}

async function listarPorTituloParcial(
  tituloBusca: string
): Promise<LivroListagem[]> {
  const result = await pool.query<LivroListagem>(
    `SELECT
       l.id,
       l.titulo,
       l.total_exemplares,
       l.status,
       STRING_AGG(DISTINCT a.nome, ', ' ORDER BY a.nome) AS autores,
       STRING_AGG(DISTINCT c.nome, ', ' ORDER BY c.nome) AS categorias
     FROM livro l
     LEFT JOIN livro_autor la ON la.livro_id = l.id
     LEFT JOIN autor a ON a.id = la.autor_id
     LEFT JOIN categoria_livro cl ON cl.livro_id = l.id
     LEFT JOIN categoria c ON c.id = cl.categoria_id
     WHERE l.titulo ILIKE $1
     GROUP BY l.id
     ORDER BY l.titulo`,
    [`%${tituloBusca}%`]
  )

  return result.rows
}

async function listarPorTituloOuAutor(termo: string): Promise<LivroListagem[]> {
  const result = await pool.query<LivroListagem>(
    `SELECT
       l.id,
       l.titulo,
       l.total_exemplares,
       l.status,
       STRING_AGG(DISTINCT a.nome, ', ' ORDER BY a.nome) AS autores,
       STRING_AGG(DISTINCT c.nome, ', ' ORDER BY c.nome) AS categorias
     FROM livro l
     LEFT JOIN livro_autor la ON la.livro_id = l.id
     LEFT JOIN autor a ON a.id = la.autor_id
     LEFT JOIN categoria_livro cl ON cl.livro_id = l.id
     LEFT JOIN categoria c ON c.id = cl.categoria_id
     WHERE l.id IN (
       SELECT l2.id FROM livro l2
       LEFT JOIN livro_autor la2 ON la2.livro_id = l2.id
       LEFT JOIN autor a2 ON a2.id = la2.autor_id
       WHERE l2.titulo ILIKE $1 OR a2.nome ILIKE $1
     )
     GROUP BY l.id
     ORDER BY l.titulo`,
    [`%${termo}%`]
  )

  return result.rows
}

async function listarPorCategorias(
  nomesCategorias: string[]
): Promise<LivroListagem[]> {
  const result = await pool.query<LivroListagem>(
    `SELECT
       l.id,
       l.titulo,
       l.total_exemplares,
       l.status,
       STRING_AGG(DISTINCT a.nome, ', ' ORDER BY a.nome) AS autores,
       STRING_AGG(DISTINCT c.nome, ', ' ORDER BY c.nome) AS categorias
     FROM livro l
     INNER JOIN categoria_livro cl ON cl.livro_id = l.id
     INNER JOIN categoria c ON c.id = cl.categoria_id
     LEFT JOIN livro_autor la ON la.livro_id = l.id
     LEFT JOIN autor a ON a.id = la.autor_id
     WHERE l.id IN (
       SELECT cl2.livro_id FROM categoria_livro cl2
       INNER JOIN categoria c2 ON c2.id = cl2.categoria_id
       WHERE c2.nome = ANY($1)
     )
     GROUP BY l.id
     ORDER BY l.titulo`,
    [nomesCategorias]
  )

  return result.rows
}

async function buscarDetalhadoPorId(
  id: number
): Promise<LivroDetalhado | null> {
  const livroResult = await pool.query<Livro>(
    'SELECT * FROM livro WHERE id = $1',
    [id]
  )
  const livro = livroResult.rows[0] as Livro | undefined
  if (!livro) return null

  const autoresResult = await pool.query<{ id: number; nome: string }>(
    `SELECT a.id, a.nome FROM autor a
     INNER JOIN livro_autor la ON la.autor_id = a.id
     WHERE la.livro_id = $1
     ORDER BY a.nome`,
    [id]
  )

  const categoriasResult = await pool.query<{ id: number; nome: string }>(
    `SELECT c.id, c.nome FROM categoria c
     INNER JOIN categoria_livro cl ON cl.categoria_id = c.id
     WHERE cl.livro_id = $1
     ORDER BY c.nome`,
    [id]
  )

  return {
    ...livro,
    autores: autoresResult.rows,
    categorias: categoriasResult.rows
  }
}

async function buscarPorTitulo(titulo: string): Promise<Livro | null> {
  const result = await pool.query<Livro>(
    'SELECT * FROM livro WHERE LOWER(titulo) = LOWER($1)',
    [titulo]
  )
  return result.rows[0] ?? null
}

async function buscarPorId(id: number): Promise<Livro | null> {
  const result = await pool.query<Livro>('SELECT * FROM livro WHERE id = $1', [
    id
  ])
  return result.rows[0] ?? null
}

async function atualizarStatus(
  id: number,
  status: Livro['status']
): Promise<void> {
  await pool.query('UPDATE livro SET status = $1 WHERE id = $2', [status, id])
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

async function atualizar(
  id: number,
  dados: AtualizarLivroInput
): Promise<Livro> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const livroResult = await client.query<Livro>(
      `UPDATE livro
       SET titulo = $1, total_exemplares = $2
       WHERE id = $3
       RETURNING *`,
      [dados.titulo, dados.totalExemplares, id]
    )

    await client.query('DELETE FROM livro_autor WHERE livro_id = $1', [id])
    for (const autorId of dados.autorIds) {
      await client.query(
        'INSERT INTO livro_autor (livro_id, autor_id) VALUES ($1, $2)',
        [id, autorId]
      )
    }

    await client.query('DELETE FROM categoria_livro WHERE livro_id = $1', [id])
    for (const categoriaId of dados.categoriaIds) {
      await client.query(
        'INSERT INTO categoria_livro (livro_id, categoria_id) VALUES ($1, $2)',
        [id, categoriaId]
      )
    }

    await client.query('COMMIT')
    return livroResult.rows[0]
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function deletar(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM livro WHERE id = $1', [id])
  return (result.rowCount ?? 0) > 0
}

export {
  listarTodos,
  listarPorAutor,
  listarPorTituloParcial,
  listarPorTituloOuAutor,
  listarPorCategorias,
  buscarDetalhadoPorId,
  buscarPorTitulo,
  buscarPorId,
  atualizarStatus,
  criar,
  atualizar,
  deletar
}

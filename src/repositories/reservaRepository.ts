import { pool } from '../database/connection'
import { Reserva, ReservaDetalhada } from '../models/Reserva'

async function contarAtivasPorLivro(livroId: number): Promise<number> {
  const result = await pool.query<{ total: string }>(
    `SELECT COUNT(*)::int AS total FROM reserva_acervo
     WHERE livro_id = $1 AND status = 'ativa'`,
    [livroId]
  )
  return Number(result.rows[0].total)
}

async function criar(
  livroId: number,
  funcionarioId: number,
  clienteId: number
): Promise<Reserva> {
  const result = await pool.query<Reserva>(
    `INSERT INTO reserva_acervo (livro_id, funcionario_id, cliente_id)
     VALUES ($1, $2, $3) RETURNING *`,
    [livroId, funcionarioId, clienteId]
  )
  return result.rows[0]
}

async function buscarPorId(id: number): Promise<Reserva | null> {
  const result = await pool.query<Reserva>(
    'SELECT * FROM reserva_acervo WHERE id = $1',
    [id]
  )
  return result.rows[0] ?? null
}

async function listarAtivasPorLivro(
  livroId: number
): Promise<ReservaDetalhada[]> {
  const result = await pool.query<ReservaDetalhada>(
    `SELECT
       r.*,
       l.titulo AS livro_titulo,
       (c.nome || ' ' || c.sobrenome) AS cliente_nome,
       (f.nome || ' ' || f.sobrenome) AS funcionario_emprestou_nome,
       NULL AS funcionario_devolveu_nome
     FROM reserva_acervo r
     INNER JOIN livro l ON l.id = r.livro_id
     INNER JOIN cliente c ON c.id = r.cliente_id
     INNER JOIN funcionario f ON f.id = r.funcionario_id
     WHERE r.livro_id = $1 AND r.status = 'ativa'
     ORDER BY r.data_reserva ASC`,
    [livroId]
  )
  return result.rows
}

async function listarHistoricoPorLivro(
  livroId: number
): Promise<ReservaDetalhada[]> {
  const result = await pool.query<ReservaDetalhada>(
    `SELECT
       r.*,
       l.titulo AS livro_titulo,
       (c.nome || ' ' || c.sobrenome) AS cliente_nome,
       (f.nome || ' ' || f.sobrenome) AS funcionario_emprestou_nome,
       (fd.nome || ' ' || fd.sobrenome) AS funcionario_devolveu_nome
     FROM reserva_acervo r
     INNER JOIN livro l ON l.id = r.livro_id
     INNER JOIN cliente c ON c.id = r.cliente_id
     INNER JOIN funcionario f ON f.id = r.funcionario_id
     LEFT JOIN funcionario fd ON fd.id = r.funcionario_devolucao_id
     WHERE r.livro_id = $1
     ORDER BY r.data_reserva DESC`,
    [livroId]
  )
  return result.rows
}

async function listarHistoricoPorCliente(
  clienteId: number
): Promise<ReservaDetalhada[]> {
  const result = await pool.query<ReservaDetalhada>(
    `SELECT
       r.*,
       l.titulo AS livro_titulo,
       (c.nome || ' ' || c.sobrenome) AS cliente_nome,
       (f.nome || ' ' || f.sobrenome) AS funcionario_emprestou_nome,
       (fd.nome || ' ' || fd.sobrenome) AS funcionario_devolveu_nome
     FROM reserva_acervo r
     INNER JOIN livro l ON l.id = r.livro_id
     INNER JOIN cliente c ON c.id = r.cliente_id
     INNER JOIN funcionario f ON f.id = r.funcionario_id
     LEFT JOIN funcionario fd ON fd.id = r.funcionario_devolucao_id
     WHERE r.cliente_id = $1
     ORDER BY r.data_reserva DESC`,
    [clienteId]
  )
  return result.rows
}

async function registrarDevolucao(
  reservaId: number,
  funcionarioDevolucaoId: number,
  dataDevolucao: string
): Promise<void> {
  await pool.query(
    `UPDATE reserva_acervo
     SET data_devolucao = $1, status = 'devolvida', funcionario_devolucao_id = $2
     WHERE id = $3`,
    [dataDevolucao, funcionarioDevolucaoId, reservaId]
  )
}

export {
  contarAtivasPorLivro,
  criar,
  buscarPorId,
  listarAtivasPorLivro,
  listarHistoricoPorLivro,
  listarHistoricoPorCliente,
  registrarDevolucao
}

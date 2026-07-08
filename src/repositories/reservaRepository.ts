import { pool } from '../infra/database/connection'
import { ClienteComEmprestimoAtivo } from '../models/Cliente'
import {
  LivroEmprestadoResumo,
  Reserva,
  ReservaDetalhada
} from '../models/Reserva'

async function contarAtivasPorLivro(livroId: number): Promise<number> {
  const result = await pool.query<{ total: string }>(
    `SELECT COUNT(*)::int AS total FROM reserva_acervo
     WHERE livro_id = $1 AND status IN ('ativa', 'atrasada')`,
    [livroId]
  )
  return Number(result.rows[0].total)
}

async function criar(
  livroId: number,
  funcionarioId: number,
  clienteId: number,
  dataPrevistaDevolucao: string
): Promise<Reserva> {
  const result = await pool.query<Reserva>(
    `INSERT INTO reserva_acervo (livro_id, funcionario_id, cliente_id, data_prevista_devolucao)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [livroId, funcionarioId, clienteId, dataPrevistaDevolucao]
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
       NULL AS funcionario_devolveu_nome,
       TO_CHAR(r.data_reserva, 'DD/MM/YYYY HH24:MI') AS data_reserva,
       TO_CHAR(r.data_devolucao, 'DD/MM/YYYY HH24:MI') AS data_devolucao,
       TO_CHAR(r.data_prevista_devolucao, 'DD/MM/YYYY') AS data_prevista_devolucao
     FROM reserva_acervo r
     INNER JOIN livro l ON l.id = r.livro_id
     INNER JOIN cliente c ON c.id = r.cliente_id
     INNER JOIN funcionario f ON f.id = r.funcionario_id
     WHERE r.livro_id = $1 AND r.status IN ('ativa', 'atrasada')
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
       (fd.nome || ' ' || fd.sobrenome) AS funcionario_devolveu_nome,
       TO_CHAR(r.data_reserva, 'DD/MM/YYYY HH24:MI') AS data_reserva,
       TO_CHAR(r.data_devolucao, 'DD/MM/YYYY HH24:MI') AS data_devolucao,
       TO_CHAR(r.data_prevista_devolucao, 'DD/MM/YYYY') AS data_prevista_devolucao
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
       (fd.nome || ' ' || fd.sobrenome) AS funcionario_devolveu_nome,
       TO_CHAR(r.data_reserva, 'DD/MM/YYYY HH24:MI') AS data_reserva,
       TO_CHAR(r.data_devolucao, 'DD/MM/YYYY HH24:MI') AS data_devolucao,
       TO_CHAR(r.data_prevista_devolucao, 'DD/MM/YYYY') AS data_prevista_devolucao
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
  funcionarioDevolucaoId: number
): Promise<void> {
  await pool.query(
    `UPDATE reserva_acervo
     SET data_devolucao = NOW(), status = 'devolvida', funcionario_devolucao_id = $1
     WHERE id = $2`,
    [funcionarioDevolucaoId, reservaId]
  )
}

async function listarLivrosComEmprestimoAtivo(): Promise<
  LivroEmprestadoResumo[]
> {
  const result = await pool.query<LivroEmprestadoResumo>(
    `SELECT
       l.id AS livro_id,
       l.titulo AS livro_titulo,
       l.total_exemplares,
       COUNT(r.id)::int AS exemplares_emprestados
     FROM reserva_acervo r
     INNER JOIN livro l ON l.id = r.livro_id
     WHERE r.status IN ('ativa', 'atrasada')
     GROUP BY l.id, l.titulo, l.total_exemplares
     ORDER BY l.titulo`
  )
  return result.rows
}

async function listarClientesComEmprestimoAtivo(): Promise<
  ClienteComEmprestimoAtivo[]
> {
  const result = await pool.query<ClienteComEmprestimoAtivo>(
    `SELECT
       c.id AS cliente_id,
       (c.nome || ' ' || c.sobrenome) AS cliente_nome,
       c.cpf AS cliente_cpf,
       l.titulo AS livro_titulo,
       r.status,
       TO_CHAR(r.data_reserva, 'DD/MM/YYYY HH24:MI') AS data_reserva,
       TO_CHAR(r.data_devolucao, 'DD/MM/YYYY HH24:MI') AS data_devolucao,
       TO_CHAR(r.data_prevista_devolucao, 'DD/MM/YYYY') AS data_prevista_devolucao
     FROM reserva_acervo r
     INNER JOIN cliente c ON c.id = r.cliente_id
     INNER JOIN livro l ON l.id = r.livro_id
     WHERE r.status IN ('ativa', 'atrasada')
     ORDER BY cliente_nome, r.data_reserva`
  )
  return result.rows
}

async function existeReservaAtivaPorCliente(
  clienteId: number
): Promise<boolean> {
  const result = await pool.query<{ total: string }>(
    `SELECT COUNT(*)::int AS total FROM reserva_acervo
     WHERE cliente_id = $1 AND status IN ('ativa', 'atrasada')`,
    [clienteId]
  )
  return Number(result.rows[0].total) > 0
}

async function atualizarStatusAtrasados(): Promise<void> {
  await pool.query(
    `UPDATE reserva_acervo
     SET status = 'atrasada'
     WHERE status = 'ativa' AND data_prevista_devolucao < CURRENT_DATE`
  )
}

export {
  contarAtivasPorLivro,
  criar,
  buscarPorId,
  listarAtivasPorLivro,
  listarHistoricoPorLivro,
  listarHistoricoPorCliente,
  registrarDevolucao,
  listarLivrosComEmprestimoAtivo,
  listarClientesComEmprestimoAtivo,
  existeReservaAtivaPorCliente,
  atualizarStatusAtrasados
}

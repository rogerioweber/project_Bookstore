import { Categoria } from '../models/Categoria'
import * as categoriaRepository from '../repositories/categoriaRepository'

async function listarCategorias(): Promise<Categoria[]> {
  return categoriaRepository.listarTodos()
}

export { listarCategorias }

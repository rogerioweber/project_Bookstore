import { livroDetalheController } from './livroDetalheController'
import { LivroListagem } from '../models/Livro'
import { listarCategorias } from '../services/categoriaService'
import {
  listarLivros,
  listarLivrosPorAutor,
  listarLivrosPorCategorias,
  listarLivrosPorTitulo
} from '../services/livroService'
import { consultarComModos } from '../utils/fluxoConsulta'
import {
  selecionarOpcao,
  selecionarMultiplo,
  pedirTexto
} from '../utils/prompts'

async function livroConsultarController(): Promise<void> {
  await consultarComModos<LivroListagem>(
    'Consultar livros',
    [
      {
        rotulo: 'Listar todos',
        buscar: async () => {
          const ordenarPor = await selecionarOpcao('Ordenar por:', [
            'Título',
            'Autor',
            'Categoria'
          ] as const)

          const mapa = {
            Título: 'titulo',
            Autor: 'autor',
            Categoria: 'categoria'
          } as const

          return listarLivros(mapa[ordenarPor])
        }
      },
      {
        rotulo: 'Consultar por autor',
        buscar: async () => {
          const nome = await pedirTexto(
            'Digite nome ou parte do nome do autor:'
          )
          if (!nome.trim()) {
            console.log('Digite ao menos um caractere para buscar.')
            return []
          }
          return listarLivrosPorAutor(nome.trim())
        }
      },
      {
        rotulo: 'Consultar por título',
        buscar: async () => {
          const titulo = await pedirTexto('Digite parte do título:')
          if (!titulo.trim()) {
            console.log('Digite ao menos um caractere para buscar.')
            return []
          }
          return listarLivrosPorTitulo(titulo.trim())
        }
      },
      {
        rotulo: 'Consultar por categoria',
        buscar: async () => {
          const categorias = await listarCategorias()
          if (categorias.length === 0) {
            console.log('Nenhuma categoria cadastrada ainda.')
            return []
          }
          const nomes = await selecionarMultiplo(
            'Selecione uma ou mais categorias:',
            categorias.map((c) => c.nome)
          )
          if (nomes.length === 0) return []
          return listarLivrosPorCategorias(nomes)
        }
      }
    ],
    (livro) =>
      `${livro.titulo} — ${livro.autores ?? 'sem autor'} [${livro.categorias ?? 'sem categoria'}] (${livro.status})`,
    async (livro) => livroDetalheController(livro.id)
  )
}

export { livroConsultarController }

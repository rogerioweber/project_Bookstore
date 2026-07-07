import inquirer from 'inquirer'

import { detalheLivroController } from './detalheLivroController'
import { LivroListagem, OrdenarLivrosPor } from '../models/Livro'
import { listarCategorias } from '../services/categoriaService'
import {
  listarLivros,
  listarLivrosPorAutor,
  listarLivrosPorCategorias,
  listarLivrosPorTitulo
} from '../services/livroService'

interface ConsultarLivroMenuPrompt {
  opcao:
    | 'Listar todos os livros'
    | 'Consultar por autor'
    | 'Consultar por título'
    | 'Consultar por categoria'
    | 'Voltar'
}

async function consultarLivroController(): Promise<void> {
  for (;;) {
    const { opcao } = await inquirer.prompt<ConsultarLivroMenuPrompt>([
      {
        type: 'select',
        name: 'opcao',
        message: 'Consultar livros',
        choices: [
          'Listar todos os livros',
          'Consultar por autor',
          'Consultar por título',
          'Consultar por categoria',
          'Voltar'
        ]
      }
    ])

    if (opcao === 'Voltar') {
      break
    }

    if (opcao === 'Listar todos os livros') await listarTodosFluxo()
    if (opcao === 'Consultar por autor') await consultarPorAutorFluxo()
    if (opcao === 'Consultar por título') await consultarPorTituloFluxo()
    if (opcao === 'Consultar por categoria') await consultarPorCategoriaFluxo()
  }
}

async function listarTodosFluxo(): Promise<void> {
  interface OrdenacaoPrompt {
    ordenarPor: 'Título' | 'Autor' | 'Categoria' | 'Voltar'
  }

  const { ordenarPor } = await inquirer.prompt<OrdenacaoPrompt>([
    {
      type: 'select',
      name: 'ordenarPor',
      message: 'Ordenar por:',
      choices: ['Título', 'Autor', 'Categoria', 'Voltar']
    }
  ])

  if (ordenarPor === 'Voltar') return

  const mapa: Record<string, OrdenarLivrosPor> = {
    Título: 'titulo',
    Autor: 'autor',
    Categoria: 'categoria'
  }

  const livros = await listarLivros(mapa[ordenarPor])
  await exibirListaEDetalhe(livros)
}

async function consultarPorAutorFluxo(): Promise<void> {
  const { nome } = await inquirer.prompt<{ nome: string }>([
    { type: 'input', name: 'nome', message: 'Nome do autor:' }
  ])

  const livros = await listarLivrosPorAutor(nome)
  await exibirListaEDetalhe(livros)
}

async function consultarPorTituloFluxo(): Promise<void> {
  const { titulo } = await inquirer.prompt<{ titulo: string }>([
    { type: 'input', name: 'titulo', message: 'Digite parte do título:' }
  ])

  if (!titulo.trim()) {
    console.log('Digite ao menos um caractere para buscar.')
    return
  }

  const livros = await listarLivrosPorTitulo(titulo.trim())
  await exibirListaEDetalhe(livros)
}

async function consultarPorCategoriaFluxo(): Promise<void> {
  const categorias = await listarCategorias()

  if (categorias.length === 0) {
    console.log('Nenhuma categoria cadastrada ainda.')
    return
  }

  const { nomes } = await inquirer.prompt<{ nomes: string[] }>([
    {
      type: 'checkbox',
      name: 'nomes',
      message: 'Selecione uma ou mais categorias:',
      choices: categorias.map((c) => c.nome)
    }
  ])

  if (nomes.length === 0) return

  const livros = await listarLivrosPorCategorias(nomes)
  await exibirListaEDetalhe(livros)
}

async function exibirListaEDetalhe(livros: LivroListagem[]): Promise<void> {
  if (livros.length === 0) {
    console.log('Nenhum livro encontrado.')
    return
  }

  const choices = livros.map((livro) => ({
    name: `${livro.titulo} — ${livro.autores ?? 'sem autor'} [${livro.categorias ?? 'sem categoria'}] (${livro.status})`,
    value: livro.id
  }))

  const { livroId } = await inquirer.prompt<{ livroId: number | 'voltar' }>([
    {
      type: 'select',
      name: 'livroId',
      message: 'Selecione um livro:',
      choices: [...choices, { name: 'Voltar', value: 'voltar' }]
    }
  ])

  if (livroId === 'voltar') return

  await detalheLivroController(livroId)
}

export { consultarLivroController }

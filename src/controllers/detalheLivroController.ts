import inquirer from 'inquirer'

import {
  atualizarNomeAutor,
  buscarAutorPorNome
} from '../services/autorService'
import {
  buscarLivroDetalhado,
  atualizarLivro,
  removerLivro,
  resolverCategoriaIds
} from '../services/livroService'

async function detalheLivroController(livroId: number): Promise<void> {
  const livro = await buscarLivroDetalhado(livroId)

  if (!livro) {
    console.log('Livro não encontrado.')
    return
  }

  console.log('\n----- Detalhes do livro -----')
  console.log(`Título: ${livro.titulo}`)
  console.log(`Exemplares: ${String(livro.total_exemplares)}`)
  console.log(`Status: ${livro.status}`)
  console.log(
    `Autores: ${livro.autores.map((a) => a.nome).join(', ') || 'nenhum'}`
  )
  console.log(
    `Categorias: ${livro.categorias.map((c) => c.nome).join(', ') || 'nenhuma'}`
  )
  console.log('------------------------------\n')

  const { opcao } = await inquirer.prompt<{
    opcao: 'Atualizar livro' | 'Remover livro' | 'Voltar'
  }>([
    {
      type: 'select',
      name: 'opcao',
      message: 'O que deseja fazer?',
      choices: ['Atualizar livro', 'Remover livro', 'Voltar']
    }
  ])

  if (opcao === 'Voltar') return

  if (opcao === 'Remover livro') {
    await removerLivroFluxo(livroId, livro.titulo)
    return
  }

  await atualizarLivroFluxo(livroId)
}

async function removerLivroFluxo(
  livroId: number,
  titulo: string
): Promise<void> {
  const { confirmar } = await inquirer.prompt<{ confirmar: boolean }>([
    {
      type: 'confirm',
      name: 'confirmar',
      message: `Tem certeza que deseja remover "${titulo}"?`,
      default: false
    }
  ])

  if (!confirmar) {
    console.log('Remoção cancelada.')
    return
  }

  await removerLivro(livroId)
  console.log('Livro removido com sucesso.')
}

async function atualizarLivroFluxo(livroId: number): Promise<void> {
  const livro = await buscarLivroDetalhado(livroId)
  if (!livro) return

  const autoresAtualizados: { id: number; nome: string }[] = []

  for (const autor of livro.autores) {
    const { novoNome } = await inquirer.prompt<{ novoNome: string }>([
      {
        type: 'input',
        name: 'novoNome',
        message: `Nome do autor (id ${String(autor.id)}):`,
        default: autor.nome
      }
    ])

    const nomeTrimado = novoNome.trim()

    if (nomeTrimado === autor.nome) {
      // não mudou nada
      autoresAtualizados.push({ id: autor.id, nome: autor.nome })
      continue
    }

    const existente = await buscarAutorPorNome(nomeTrimado)

    if (existente && existente.id !== autor.id) {
      // Já existe outro autor com esse nome — pergunta se quer vincular a ele
      const { vincular } = await inquirer.prompt<{ vincular: boolean }>([
        {
          type: 'confirm',
          name: 'vincular',
          message: `Já existe o autor "${existente.nome}" cadastrado. Deseja vincular o livro a ele (em vez de renomear "${autor.nome}")?`,
          default: true
        }
      ])

      if (vincular) {
        autoresAtualizados.push({ id: existente.id, nome: existente.nome })
      } else {
        console.log(`Mantendo o autor "${autor.nome}" sem alterações.`)
        autoresAtualizados.push({ id: autor.id, nome: autor.nome })
      }
      continue
    }

    // Nome novo, não existe ainda -> renomear normalmente
    const atualizado = await atualizarNomeAutor(autor.id, nomeTrimado)
    autoresAtualizados.push({ id: atualizado.id, nome: atualizado.nome })
  }

  const resposta = await inquirer.prompt<{
    titulo: string
    totalExemplares: number
    categorias: string
  }>([
    {
      type: 'input',
      name: 'titulo',
      message: 'Novo título:',
      default: livro.titulo
    },
    {
      type: 'number',
      name: 'totalExemplares',
      message: 'Nova quantidade de exemplares:',
      default: livro.total_exemplares
    },
    {
      type: 'input',
      name: 'categorias',
      message: 'Categoria(s) (separe por vírgula):',
      default: livro.categorias.map((c) => c.nome).join(', ')
    }
  ])

  const nomesCategorias = resposta.categorias
    .split(',')
    .map((nome) => nome.trim())
    .filter((nome) => nome.length > 0)

  if (nomesCategorias.length === 0) {
    console.log('É necessário informar ao menos uma categoria.')
    return
  }

  const categoriaIds = await resolverCategoriaIds(nomesCategorias)

  await atualizarLivro(livroId, {
    titulo: resposta.titulo,
    totalExemplares: resposta.totalExemplares,
    autorIds: autoresAtualizados.map((a) => a.id),
    categoriaIds
  })

  console.log('Livro atualizado com sucesso!')
}

export { detalheLivroController }

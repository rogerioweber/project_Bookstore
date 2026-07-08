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
import {
  selecionarOpcao,
  confirmar,
  pedirTexto,
  pedirNumero
} from '../utils/prompts'

async function livroDetalheController(livroId: number): Promise<void> {
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

  const opcao = await selecionarOpcao('O que deseja fazer?', [
    'Atualizar livro',
    'Remover livro',
    'Voltar'
  ] as const)

  if (opcao === 'Voltar') return
  if (opcao === 'Remover livro') return removerLivroFluxo(livroId, livro.titulo)

  await atualizarLivroFluxo(livroId)
}

async function removerLivroFluxo(
  livroId: number,
  titulo: string
): Promise<void> {
  const confirmado = await confirmar(
    `Tem certeza que deseja remover "${titulo}"?`
  )

  if (!confirmado) {
    console.log('Remoção cancelada.')
    return
  }

  try {
    await removerLivro(livroId)
    console.log('Livro removido com sucesso.')
  } catch (error) {
    console.log((error as Error).message)
  }
}

async function atualizarLivroFluxo(livroId: number): Promise<void> {
  const livro = await buscarLivroDetalhado(livroId)
  if (!livro) return

  const autoresAtualizados: { id: number; nome: string }[] = []

  for (const autor of livro.autores) {
    const novoNome = await pedirTexto(
      `Nome do autor (id ${String(autor.id)}):`,
      autor.nome
    )
    const nomeTrimado = novoNome.trim()

    if (nomeTrimado === autor.nome) {
      autoresAtualizados.push({ id: autor.id, nome: autor.nome })
      continue
    }

    const existente = await buscarAutorPorNome(nomeTrimado)

    if (existente && existente.id !== autor.id) {
      const vincular = await confirmar(
        `Já existe o autor "${existente.nome}" cadastrado. Deseja vincular o livro a ele (em vez de renomear "${autor.nome}")?`,
        true
      )

      if (vincular) {
        autoresAtualizados.push({ id: existente.id, nome: existente.nome })
      } else {
        console.log(`Mantendo o autor "${autor.nome}" sem alterações.`)
        autoresAtualizados.push({ id: autor.id, nome: autor.nome })
      }
      continue
    }

    const atualizado = await atualizarNomeAutor(autor.id, nomeTrimado)
    autoresAtualizados.push({ id: atualizado.id, nome: atualizado.nome })
  }

  const titulo = await pedirTexto('Novo título:', livro.titulo)
  const totalExemplares = await pedirNumero(
    'Nova quantidade de exemplares:',
    livro.total_exemplares
  )
  const categoriasTexto = await pedirTexto(
    'Categoria(s) (separe por vírgula):',
    livro.categorias.map((c) => c.nome).join(', ')
  )

  const nomesCategorias = categoriasTexto
    .split(',')
    .map((nome) => nome.trim())
    .filter((nome) => nome.length > 0)

  if (nomesCategorias.length === 0) {
    console.log('É necessário informar ao menos uma categoria.')
    return
  }

  const categoriaIds = await resolverCategoriaIds(nomesCategorias)

  await atualizarLivro(livroId, {
    titulo,
    totalExemplares,
    autorIds: autoresAtualizados.map((a) => a.id),
    categoriaIds
  })

  console.log('Livro atualizado com sucesso!')
}

export { livroDetalheController }

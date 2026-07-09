import { Autor } from '../models/Autor'
import {
  cadastrarAutor,
  listarAutores,
  buscarAutoresPorNome,
  atualizarNomeAutor,
  removerAutor
} from '../services/autorService'
import { consultarComModos } from '../utils/fluxoConsulta'
import { selecionarOpcao, confirmar, pedirTexto } from '../utils/prompts'

async function autorController(): Promise<void> {
  for (;;) {
    const opcao = await selecionarOpcao('Gerenciar autores', [
      'Cadastrar autor',
      'Consultar autores',
      'Voltar'
    ] as const)

    if (opcao === 'Voltar') break

    try {
      if (opcao === 'Cadastrar autor') await cadastrarAutorFluxo()
      if (opcao === 'Consultar autores') await consultarAutoresFluxo()
    } catch (error) {
      console.log((error as Error).message)
    }
  }
}

async function cadastrarAutorFluxo(): Promise<void> {
  const nome = await pedirTexto('Nome do autor:')
  const autor = await cadastrarAutor(nome)
  console.log(`Autor "${autor.nome}" cadastrado com sucesso!`)
}

async function consultarAutoresFluxo(): Promise<void> {
  await consultarComModos<Autor>(
    'Consultar autores',
    [
      { rotulo: 'Listar todos', buscar: listarAutores },
      {
        rotulo: 'Buscar por nome',
        buscar: async () => {
          const nome = await pedirTexto('Digite o nome ou parte dele:')
          if (!nome.trim()) {
            console.log('Digite ao menos um caractere para buscar.')
            return []
          }
          return buscarAutoresPorNome(nome.trim())
        }
      }
    ],
    (a) => a.nome,
    detalheAutorFluxo
  )
}

async function detalheAutorFluxo(autor: Autor): Promise<void> {
  console.log(`\nID: ${String(autor.id)}\nNome: ${autor.nome}\n`)

  const acao = await selecionarOpcao('O que deseja fazer?', [
    'Atualizar autor',
    'Remover autor',
    'Voltar'
  ] as const)

  if (acao === 'Voltar') return
  if (acao === 'Remover autor') return removerAutorFluxo(autor)

  const novoNome = await pedirTexto('Novo nome:', autor.nome)
  const atualizado = await atualizarNomeAutor(autor.id, novoNome)
  console.log(`Autor atualizado para "${atualizado.nome}" com sucesso!`)
}

async function removerAutorFluxo(autor: Autor): Promise<void> {
  const confirmado = await confirmar(
    `Tem certeza que deseja remover "${autor.nome}"?`
  )

  if (!confirmado) {
    console.log('Remoção cancelada.')
    return
  }

  await removerAutor(autor.id)
  console.log('Autor removido com sucesso.')
}

export { autorController }

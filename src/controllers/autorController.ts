import inquirer from 'inquirer'

import {
  cadastrarAutor,
  listarAutores,
  buscarAutorPorId,
  atualizarNomeAutor,
  removerAutor,
  buscarAutorPorNome
} from '../services/autorService'

async function autorController(): Promise<void> {
  for (;;) {
    const { opcao } = await inquirer.prompt<{
      opcao:
        | 'Cadastrar autor'
        | 'Listar autores'
        | 'Consultar autor nome (ou parte dele)'
        | 'Atualizar autor'
        | 'Remover autor'
        | 'Voltar'
    }>([
      {
        type: 'select',
        name: 'opcao',
        message: 'Gerenciar autores',
        choices: [
          'Cadastrar autor',
          'Listar autores',
          'Consultar autor nome (ou parte dele)',
          'Atualizar autor',
          'Remover autor',
          'Voltar'
        ]
      }
    ])

    if (opcao === 'Voltar') break

    try {
      if (opcao === 'Cadastrar autor') await cadastrarAutorFluxo()
      if (opcao === 'Listar autores') await listarAutoresFluxo()
      if (opcao === 'Consultar autor nome (ou parte dele)')
        await consultarAutorFluxo()
      if (opcao === 'Atualizar autor') await atualizarAutorFluxo()
      if (opcao === 'Remover autor') await removerAutorFluxo()
    } catch (error) {
      console.log((error as Error).message)
    }
  }
}

async function cadastrarAutorFluxo(): Promise<void> {
  const { nome } = await inquirer.prompt<{ nome: string }>([
    { type: 'input', name: 'nome', message: 'Nome do autor:' }
  ])

  const autor = await cadastrarAutor(nome)
  console.log(
    `Autor "${autor.nome}" cadastrado com sucesso! (id: ${String(autor.id)})`
  )
}

async function listarAutoresFluxo(): Promise<void> {
  const autores = await listarAutores()

  if (autores.length === 0) {
    console.log('Nenhum autor cadastrado.')
    return
  }

  console.log('\n----- Autores cadastrados -----')
  for (const a of autores) {
    console.log(`[${String(a.id)}] ${a.nome}`)
  }
  console.log('--------------------------------\n')
}

async function consultarAutorFluxo(): Promise<void> {
  const { nome } = await inquirer.prompt<{ nome: string }>([
    { type: 'input', name: 'nome', message: 'Digite o nome ou parte dele:' }
  ])

  if (!nome.trim()) {
    console.log('Digite ao menos um caractere para buscar.')
    return
  }
  const autor = await buscarAutorPorNome(nome.trim())

  if (!autor) {
    console.log('Autor não encontrado.')
    return
  }

  console.log(`\nID: ${String(autor.id)}\nNome: ${autor.nome}\n`)
}

async function atualizarAutorFluxo(): Promise<void> {
  const { id } = await inquirer.prompt<{ id: number }>([
    { type: 'number', name: 'id', message: 'ID do autor a atualizar:' }
  ])

  const autor = await buscarAutorPorId(id)
  if (!autor) {
    console.log('Autor não encontrado.')
    return
  }

  const { novoNome } = await inquirer.prompt<{ novoNome: string }>([
    {
      type: 'input',
      name: 'novoNome',
      message: 'Novo nome:',
      default: autor.nome
    }
  ])

  const atualizado = await atualizarNomeAutor(id, novoNome)
  console.log(`Autor atualizado para "${atualizado.nome}" com sucesso!`)
}

async function removerAutorFluxo(): Promise<void> {
  const { id } = await inquirer.prompt<{ id: number }>([
    { type: 'number', name: 'id', message: 'ID do autor a remover:' }
  ])

  const autor = await buscarAutorPorId(id)
  if (!autor) {
    console.log('Autor não encontrado.')
    return
  }

  const { confirmar } = await inquirer.prompt<{ confirmar: boolean }>([
    {
      type: 'confirm',
      name: 'confirmar',
      message: `Tem certeza que deseja remover "${autor.nome}"?`,
      default: false
    }
  ])

  if (!confirmar) {
    console.log('Remoção cancelada.')
    return
  }

  try {
    await removerAutor(id)
    console.log('Autor removido com sucesso.')
  } catch (error) {
    console.log((error as Error).message)
    return
  }
}

export { autorController }

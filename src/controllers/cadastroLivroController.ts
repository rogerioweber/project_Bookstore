// src/controllers/cadastroLivroController.ts
import inquirer from 'inquirer'

import { cadastrarLivro } from '../services/livroService'

interface CadastroLivroPrompt {
  titulo: string
  totalExemplares: number
  autores: string
  categorias: string
}

async function cadastroLivroController(): Promise<void> {
  const resposta = await inquirer.prompt<CadastroLivroPrompt>([
    { type: 'input', name: 'titulo', message: 'Título do livro:' },
    {
      type: 'number',
      name: 'totalExemplares',
      message: 'Quantidade de exemplares:',
      default: 1
    },
    {
      type: 'input',
      name: 'autores',
      message: 'Autor(es) (separe por vírgula se houver mais de um):'
    },
    {
      type: 'input',
      name: 'categorias',
      message: 'Categoria(s) (separe por vírgula se houver mais de uma):'
    }
  ])

  const nomesAutores = resposta.autores
    .split(',')
    .map((nome) => nome.trim())
    .filter((nome) => nome.length > 0)

  const nomesCategorias = resposta.categorias
    .split(',')
    .map((nome) => nome.trim())
    .filter((nome) => nome.length > 0)

  try {
    const livro = await cadastrarLivro(
      resposta.titulo,
      resposta.totalExemplares,
      nomesAutores,
      nomesCategorias
    )

    console.log(`Livro "${livro.titulo}" cadastrado com sucesso!`)
  } catch {
    console.log('Erro ao cadastrar livro')
    return
  }
}

export { cadastroLivroController }

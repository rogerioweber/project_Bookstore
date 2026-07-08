import { cadastrarLivro } from '../services/livroService'
import { pedirTexto, pedirNumero } from '../utils/prompts'

async function livroCadastroController(): Promise<void> {
  const titulo = await pedirTexto('Título do livro:')
  const totalExemplares = await pedirNumero('Quantidade de exemplares:', 1)
  const autores = await pedirTexto(
    'Autor(es) (separe por vírgula se houver mais de um):'
  )
  const categorias = await pedirTexto(
    'Categoria(s) (separe por vírgula se houver mais de uma):'
  )

  const nomesAutores = autores
    .split(',')
    .map((nome) => nome.trim())
    .filter((nome) => nome.length > 0)

  const nomesCategorias = categorias
    .split(',')
    .map((nome) => nome.trim())
    .filter((nome) => nome.length > 0)

  try {
    const livro = await cadastrarLivro(
      titulo,
      totalExemplares,
      nomesAutores,
      nomesCategorias
    )

    console.log(`Livro "${livro.titulo}" cadastrado com sucesso!`)
  } catch (error) {
    console.log((error as Error).message)
  }
}

export { livroCadastroController }

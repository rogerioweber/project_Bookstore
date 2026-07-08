import { listarLivrosPorTituloOuAutor } from '../services/livroService'
import { pedirTexto } from '../utils/prompts'

async function consultaPublicaController(): Promise<void> {
  const termo = await pedirTexto('Digite o título do livro ou o nome do autor:')

  if (!termo.trim()) {
    console.log('Digite ao menos um caractere para buscar.')
    return
  }

  const livros = await listarLivrosPorTituloOuAutor(termo.trim())

  if (livros.length === 0) {
    console.log('Nenhum livro encontrado com esse nome.')
    return
  }

  console.log('\n----- Resultado da busca -----')
  for (const livro of livros) {
    const disponibilidade =
      livro.status === 'disponivel' ? 'Disponível' : 'Indisponível'

    console.log(
      `${livro.titulo} — ${livro.autores ?? 'sem autor'} [${disponibilidade}]`
    )
  }
  console.log('-------------------------------\n')
}

export { consultaPublicaController }

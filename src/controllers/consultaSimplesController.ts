import inquirer from 'inquirer'

import { listarLivrosPorTituloOuAutor } from '../services/livroService'

async function consultaPublicaController(): Promise<void> {
  const { termo } = await inquirer.prompt<{ termo: string }>([
    {
      type: 'input',
      name: 'termo',
      message: 'Digite o título do livro ou o nome do autor:'
    }
  ])

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

import { selecionarOpcao, selecionarItem } from './prompts'

interface ModoBusca<T> {
  rotulo: string
  buscar: () => Promise<T[]>
}

async function consultarComModos<T>(
  tituloMenu: string,
  modos: ModoBusca<T>[],
  obterRotulo: (item: T) => string,
  aoSelecionar: (item: T) => Promise<void>
): Promise<void> {
  const rotulos = [...modos.map((m) => m.rotulo), 'Voltar'] as const
  const escolha = await selecionarOpcao(tituloMenu, rotulos)

  if (escolha === 'Voltar') return

  const modo = modos.find((m) => m.rotulo === escolha)
  if (!modo) return

  const itens = await modo.buscar()

  if (itens.length === 0) {
    console.log('Nenhum resultado encontrado.')
    return
  }

  const selecionado = await selecionarItem('Selecione:', itens, obterRotulo)
  if (!selecionado) return

  await aoSelecionar(selecionado)
}

export { consultarComModos }

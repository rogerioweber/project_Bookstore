import inquirer from 'inquirer'

async function selecionarOpcao<T extends string>(
  mensagem: string,
  opcoes: readonly T[]
): Promise<T> {
  console.log('\n' + '─'.repeat(40))
  const { opcao } = await inquirer.prompt<{ opcao: T }>([
    {
      type: 'select',
      name: 'opcao',
      message: mensagem,
      choices: [...opcoes],
      loop: false
    }
  ])
  return opcao
}

async function selecionarMultiplo<T extends string>(
  mensagem: string,
  opcoes: readonly T[]
): Promise<T[]> {
  const { selecionados } = await inquirer.prompt<{ selecionados: T[] }>([
    {
      type: 'checkbox',
      name: 'selecionados',
      message: mensagem,
      choices: [...opcoes],
      loop: false
    }
  ])
  return selecionados
}

async function confirmar(mensagem: string, padrao = false): Promise<boolean> {
  const { confirmado } = await inquirer.prompt<{ confirmado: boolean }>([
    { type: 'confirm', name: 'confirmado', message: mensagem, default: padrao }
  ])
  return confirmado
}

async function pedirTexto(
  mensagem: string,
  valorPadrao?: string
): Promise<string> {
  const { texto } = await inquirer.prompt<{ texto: string }>([
    { type: 'input', name: 'texto', message: mensagem, default: valorPadrao }
  ])
  return texto
}

async function pedirSenha(mensagem: string): Promise<string> {
  const { senha } = await inquirer.prompt<{ senha: string }>([
    { type: 'password', name: 'senha', message: mensagem, mask: '*' }
  ])
  return senha
}

async function pedirNumero(
  mensagem: string,
  valorPadrao?: number
): Promise<number> {
  const { numero } = await inquirer.prompt<{ numero: number }>([
    { type: 'number', name: 'numero', message: mensagem, default: valorPadrao }
  ])
  return numero
}

async function selecionarItem<T>(
  mensagem: string,
  itens: T[],
  obterRotulo: (item: T) => string
): Promise<T | null> {
  const VOLTAR = '__voltar__'

  const { indice } = await inquirer.prompt<{
    indice: number | typeof VOLTAR
  }>([
    {
      type: 'select',
      name: 'indice',
      message: mensagem,
      choices: [
        ...itens.map((item, i) => ({ name: obterRotulo(item), value: i })),
        { name: 'Voltar', value: VOLTAR }
      ],
      loop: false
    }
  ])

  if (indice === VOLTAR) return null
  return itens[indice]
}

export {
  selecionarOpcao,
  selecionarMultiplo,
  confirmar,
  pedirTexto,
  pedirSenha,
  pedirNumero,
  selecionarItem
}

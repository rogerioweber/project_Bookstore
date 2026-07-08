import { testConnection } from './infra/database/connection'
import { menuController } from './menus/menuInicial'

async function main() {
  console.log('Iniciando programa BookStore')
  let rodando = true
  try {
    await testConnection()
  } catch (error) {
    console.log((error as Error).message)
  }
  try {
    while (rodando) {
      rodando = await menuController()
    }
  } catch (error) {
    console.log((error as Error).message)
  } finally {
    console.log('Encerrando programa...')
    console.log('Programa finalizado.')
  }
}

main().catch(console.error)

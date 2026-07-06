import { menuController } from './controllers/menu'
import { testConnection } from './database/connection'

async function main() {
  console.log('Iniciando programa BookStore')
  let rodando = true
  try {
    await testConnection()
  } catch (error) {
    console.log(error)
  }
  try {
    while (rodando) {
      rodando = await menuController()
    }
  } catch (error) {
    console.log(error)
  } finally {
    console.log('Encerrando programa...')
    console.log('Programa finalizado.')
  }
}

main().catch(console.error)

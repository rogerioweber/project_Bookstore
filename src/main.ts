import { testConnection } from './database/connection'

async function main() {
  console.log('🚀 Iniciando aplicação BookStore')
  await testConnection()
}

main().catch(console.error)

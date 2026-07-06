import { Pool } from 'pg'
import 'dotenv/config'

export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT)
})

export async function testConnection() {
  try {
    const client = await pool.connect()
    console.log('✅ Conectado ao PostgreSQL com sucesso!')
    client.release()
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco:', error)
    process.exit(1)
  }
}

import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'

const envPath = fileURLToPath(
  new URL('../../.env.test', import.meta.url),
)

dotenv.config({
  path: envPath,
  override: true,
})

process.env.NODE_ENV = 'test'

console.log('Test environment loaded')
/* Push payload schema to sqlite via drizzle dev-push. Run before prod boot on fresh volumes. */
process.env.NODE_ENV = 'development'
const nextenv = await import('@next/env')
const loadEnvConfig = nextenv.loadEnvConfig || nextenv.default?.loadEnvConfig
loadEnvConfig(process.cwd())
const { getPayload } = await import('payload')
const config = (await import('./payload-config.ts')).default
const payload = await getPayload({ config })
console.log('SCHEMA-PUSH-OK', Object.keys(payload.collections || {}).length, 'collections')
process.exit(0)

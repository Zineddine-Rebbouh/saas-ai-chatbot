import { NextResponse } from 'next/server'
import { client } from '@/lib/prisma'

const startTime = Date.now()

export async function GET() {
  const checks = {
    database: 'unknown' as 'ok' | 'error' | 'unknown',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '1.0.0',
  }

  // Database check
  try {
    await client.$queryRaw`SELECT 1`
    checks.database = 'ok'
  } catch {
    checks.database = 'error'
  }

  const allOk = checks.database === 'ok'

  return NextResponse.json(
    {
      status: allOk ? 'ok' : 'degraded',
      message: allOk ? 'All systems operational' : 'Some systems degraded',
      checks,
    },
    { status: allOk ? 200 : 503 }
  )
}

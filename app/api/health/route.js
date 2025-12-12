export async function GET() {
  return Response.json(
    { 
      ok: true, 
      timestamp: new Date().toISOString(),
      service: 'Todo App API',
      version: '1.0.0'
    },
    { status: 200 }
  )
}
import type { ConsultResponse } from './types'

const BASE = ''   // proxied by Vite dev server; empty = same origin

export async function consult(
  scene_idea: string,
  genre: string,
  min_rating: number,
): Promise<ConsultResponse> {
  const res = await fetch(`${BASE}/api/consult`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scene_idea, genre, min_rating }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Request failed')
  }
  return res.json() as Promise<ConsultResponse>
}

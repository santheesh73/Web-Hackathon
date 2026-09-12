import { HealthResponse, HealthResponseSchema } from '../../src/shared/schemas/health';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function getHealthStatus(): Promise<HealthResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return HealthResponseSchema.parse(json);
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function handleSupabaseError(err: any): never {
  const msg = err?.message ?? String(err);
  if (msg.toLowerCase().includes('unique') || err?.code === '23505') {
    throw new ApiError(409, 'Conflict: record exists');
  }
  throw new ApiError(500, msg);
}

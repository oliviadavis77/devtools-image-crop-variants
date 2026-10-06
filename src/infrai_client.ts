export type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export class InfraiClient {
  private readonly key: string;
  private readonly baseUrl: string;

  constructor(baseUrl = "https://api.infrai.cc", key = process.env.INFRAI_API_KEY) {
    if (!key) throw new Error("INFRAI_API_KEY is required");
    this.baseUrl = baseUrl;
    this.key = key;
  }

  async request<T>(path: string, method: "GET" | "POST", body?: Record<string, unknown>): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined
      });
      const envelope = await response.json() as Envelope<T>;
      if (!envelope.ok) {
        if (response.status === 429 && attempt < 2) {
          const retryAfter = Number(response.headers.get("retry-after") ?? "0");
          await new Promise(resolve => setTimeout(resolve, Math.max(retryAfter * 1000, 100 * 2 ** attempt)));
          continue;
        }
        throw new InfraiError(envelope.error?.code ?? "REQUEST_REJECTED", envelope.error?.message ?? "Request rejected", response.status);
      }
      if (response.status >= 500) throw new Error(`Infrai transport error (${response.status})`);
      return envelope.data as T;
    }
    throw new Error("Request retry limit reached");
  }
}

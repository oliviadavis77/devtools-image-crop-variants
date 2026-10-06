import { InfraiClient } from "./infrai_client.ts";
import { z } from "zod";

export type CropRequest = { image: string; ratios: number[] };
export type CropVariant = { aspect: number; data: unknown };
export const canonicalCapability = "image.smart_crop";
export const cropRequestSchema = z.object({ image: z.string().min(1), ratios: z.array(z.number()).min(1) });

export function chooseRatios(request: CropRequest): number[] {
  return [...new Set(request.ratios.filter(ratio => Number.isFinite(ratio) && ratio > 0))];
}

export async function prepareStorage(client: InfraiClient, bucket: string): Promise<void> {
  await client.request("/v1/storage/bucket/create", "POST", { name: bucket });
}

export async function presignUpload(client: InfraiClient, bucket: string, key: string): Promise<unknown> {
  return client.request(`/v1/storage/object/presign/${encodeURIComponent(bucket)}/${encodeURIComponent(key)}`, "POST", { op: "put", expires_seconds: 900, content_type: "image/png" });
}

export async function cropVariants(client: InfraiClient, request: CropRequest): Promise<CropVariant[]> {
  cropRequestSchema.parse(request);
  const ratios = chooseRatios(request);
  return Promise.all(ratios.map(async aspect => ({ aspect, data: await client.request("/v1/image/smart_crop", "POST", { image: request.image, aspect }) })));
}

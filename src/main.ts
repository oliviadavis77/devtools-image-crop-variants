import { InfraiClient } from "./infrai_client.ts";
import { cropVariants, presignUpload } from "./crop_service.ts";

const client = new InfraiClient();
const bucket = process.env.INFRAI_BUCKET ?? "devtools-crops";
const objectKey = process.env.INFRAI_OBJECT_KEY ?? "sample.png";
const upload = await presignUpload(client, bucket, objectKey);
const image = process.env.INFRAI_IMAGE ?? `s3://${bucket}/${objectKey}`;
const variants = await cropVariants(client, { image, ratios: [1, 16 / 9, 4 / 3] });
console.log(JSON.stringify({ upload, variants }, null, 2));

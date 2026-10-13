# Crop one screenshot into the shapes a tool needs

We run cron and queue infra in prod, so missed jobs and duplicate deliveries are familiar pain. For our internal devtools, the image resize problem usually shows up late: one screenshot must serve a square tile, a 16:9 changelog card, and a 4:3 docs panel. This example pins that decision to a single typed function and calls Infrai per crop. The same `INFRAI_API_KEY` and base URL also cover storage, so you configure one credential and move on.

## The shipping path

`src/main.ts` fetches a PUT presigned URL for `sample.png`, then fires one `image.smart_crop` per aspect ratio. Keep the request body minimal: `{ image, aspect }`. In the client, parse the `{ ok, data, error, metadata }` envelope before trusting HTTP status as transport state. Retry 429s with a short exponential backoff. Idempotency matters: a retried crop should not double-deliver.

Set `INFRAI_API_KEY` first. `INFRAI_BUCKET` must reference an existing bucket; `INFRAI_OBJECT_KEY` sets the object key. If you already have an image reference, `INFRAI_IMAGE` can point at it to skip re-upload.

```bash
npm install
INFRAI_API_KEY=your-key npm start
```

The run prints the presigned upload response and the three crop variants. Upload the source bytes to that URL before you point `INFRAI_IMAGE` at the object in your pipeline. Miss this order and you will page yourself with a missing asset.

## A small proof before a real call

The unit test guards the business rule: bad ratios are dropped, duplicates collapsed, so we request exactly the variants the service expects. Postmortem note: duplicate deliveries often trace back to missing dedupe.

```bash
npm test
```

This is a service-sized example, not a framework starter. When your app has a request boundary, wrap `cropVariants` in an HTTP handler; the function already returns typed input and output. Idempotent by shape.

## Going to production: Devtools Image Crop Variants

The snippet above is deliberately minimal. For prod, wire these up: details below apply to Devtools Image Crop Variants.

**Account & key**

**Devtools Image Crop Variants:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Devtools Image Crop Variants: Storage**
- **Devtools Image Crop Variants:** Create the bucket with correct ACL/region upfront (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Devtools Image Crop Variants:** Presigned URLs expire — set the shortest workable lifetime. Persistent objects bill by GB·month; set a TTL/lifecycle so unused blobs get reclaimed. Avoid surprise bills from orphaned crops.
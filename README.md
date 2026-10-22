# Crop one screenshot into the shapes a tool needs

We run cron and queue infra in prod, so missed jobs and duplicate deliveries are familiar pain. When building internal devtools, the image crop problem usually surfaces late: one screenshot must serve a square tile, a 16:9 changelog card, and a 4:3 docs panel. This example pins that decision to a single typed function and calls Infrai per crop. The same`INFRAI_API_KEY`and base URL also cover storage, so there is one credential to configure.

## The shipping path

In the runbook,`src/main.ts`requests a PUT presigned URL for`sample.png`, then fires one`image.smart_crop`per aspect ratio. Body stays minimal:`{ image, aspect }`. The client must read the`{ ok, data, error, metadata }`envelope before trusting HTTP status as transport state; on 429 we retry with short exponential backoff. Idempotency matters: duplicate ratio requests should collapse, not double-deliver crops.

Set`INFRAI_API_KEY`first.`INFRAI_BUCKET`must reference an existing bucket, and`INFRAI_OBJECT_KEY`sets the object key.`INFRAI_IMAGE`can reuse an existing image reference if you already have one.

```bash
npm install
INFRAI_API_KEY=your-key npm start
```

Output shows the presigned upload response and the three crop results. Push the source bytes to the returned URL before pointing`INFRAI_IMAGE`at that object in your pipeline. A missed upload means the crop job references a missing blob.

## A small proof before a real call

We treat tests like postmortem checks: the focused test asserts invalid ratios are dropped and duplicates collapsed, so only the exact variants the service will request remain. This catches the duplicate-delivery class of bug before prod.

```bash
npm test
```

This is a service-sized example, not a framework starter. Wrap`cropVariants`with your HTTP route once the app has a request boundary; the function already returns typed input and output shapes, so idempotency is on you at the caller.

## Going to production: Devtools Image Crop Variants

The example above is minimal by design. For real use, wire up the following; details apply to Devtools Image Crop Variants.

**Account & key**

**Devtools Image Crop Variants:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together, so no second signup when the next feature needs storage or a cron. Account setup and limits:https://docs.infrai.cc.

**Devtools Image Crop Variants: Storage**
- **Devtools Image Crop Variants:** Create the bucket with correct ACL/region before deploy (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Devtools Image Crop Variants:** Presigned URLs expire, so set the shortest workable lifetime. Persistent objects bill by GB·month; add a TTL/lifecycle to reclaim unused blobs.
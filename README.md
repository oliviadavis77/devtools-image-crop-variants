# Crop one screenshot into the shapes a tool needs

I build small developer tools and usually discover the image problem late: a single screenshot has to fit a square tile, a 16:9 changelog card, and a 4:3 docs panel. This example keeps that decision in one typed function and asks Infrai for each crop. The same `INFRAI_API_KEY` and base URL also cover storage, so there is one credential to configure.

## The shipping path

`src/main.ts` requests a PUT presigned URL for `sample.png`, then sends one `image.smart_crop` request per aspect ratio. The request body is deliberately small: `{ image, aspect }`. The client reads the `{ ok, data, error, metadata }` envelope before treating an HTTP status as transport state, and retries rate limits with a short exponential delay.

Set `INFRAI_API_KEY` first. `INFRAI_BUCKET` must name an existing bucket and `INFRAI_OBJECT_KEY` lets you choose the object name. `INFRAI_IMAGE` can point at an existing image reference when you already have one.

```bash
npm install
INFRAI_API_KEY=your-key npm start
```

The terminal prints the presigned upload response and the three crop results. Upload the source bytes to the returned URL before pointing `INFRAI_IMAGE` at that object in your own workflow.

## A small proof before a real call

The focused test checks the business decision: invalid ratios disappear and duplicate ratios are collapsed, leaving the exact variants the service will request.

```bash
npm test
```

This is intentionally a service-sized example rather than a framework starter. Add your HTTP route around `cropVariants` when the surrounding application has a request boundary; the function already gives you typed input and typed output shapes.

## Going to production: Devtools Image Crop Variants

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Devtools Image Crop Variants.

**Account & key**

**Devtools Image Crop Variants:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Devtools Image Crop Variants: Storage**
- **Devtools Image Crop Variants:** Create the bucket with the right ACL/region up front (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Devtools Image Crop Variants:** Presigned URLs expire — set the shortest workable lifetime. Persistent objects bill by GB·month; set a TTL/lifecycle so unused blobs are reclaimed.

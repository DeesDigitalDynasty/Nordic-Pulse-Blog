# Nordic Pulse: setup after the security fixes

## 1. Create the API key (a password you invent)
Run in any terminal with Node installed:

    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

Copy the 64-character result. Never paste it into code, chat or screenshots.

## 2. Add environment variables in Vercel
Project > Settings > Environment Variables (Production):

| Name | Value |
|---|---|
| MAKE_WEBHOOK_API_KEY | the key from step 1 |
| GEMINI_API_KEY | from https://aistudio.google.com/apikey |
| NEWS_FEEDS | up to 5 RSS URLs, comma separated |
| UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN | from the Upstash Redis integration (Vercel > Storage / Marketplace). If Vercel created KV_REST_API_URL and KV_REST_API_TOKEN instead, that works too. |

Then redeploy. Without Redis, articles do not persist on Vercel.

## 3. Test the lock (replace YOUR-DOMAIN with the production domain)

    curl -i -X POST https://YOUR-DOMAIN/api/webhook/make -H "Content-Type: application/json" -d '{}'
    # expect 401

    curl -i https://YOUR-DOMAIN/api/make-config
    # expect 404 (the endpoint no longer exists)

    curl -i -X POST https://YOUR-DOMAIN/api/jobs/daily-ingest -H "x-api-key: YOUR_KEY"
    # expect 200 with counts once GEMINI_API_KEY and NEWS_FEEDS are set

## 4. Make.com scenario (Design A, about 3 credits per day)
1. Create a scenario. Trigger: Schedule, once a day.
2. Add HTTP > Make a request. URL: https://YOUR-DOMAIN/api/jobs/daily-ingest, Method: POST,
   Header x-api-key = your key, Timeout 60.
3. Enable error handling that emails you on failure. Run once to test, then activate.

Alternative (Design B): Make fetches the RSS feeds and POSTs { "items": [ {title, link, snippet, source} ] }
to /api/webhook/make/batch. The server still summarizes everything in one Gemini call.

## Reviewing drafts
Items the model flags as needsReview, and any category in HOLD_CATEGORIES, are saved as drafts:

    curl https://YOUR-DOMAIN/api/admin/drafts -H "x-api-key: YOUR_KEY"
    curl -X POST https://YOUR-DOMAIN/api/admin/articles/ARTICLE_ID/publish -H "x-api-key: YOUR_KEY"

Contact form messages: GET /api/admin/messages (same header).

## Old key
The previous fallback key was in the public repo and is no longer accepted anywhere.

# API Costs

## PokeAPI v2

- **Provider**: PokeAPI (community-maintained)
- **Pricing model**: Free, open-source
- **Authentication**: None required
- **Rate limits**: 100 requests per minute (recommended fair use)
- **Cost per request**: $0.00
- **Monthly cost estimate**: $0.00
- **Caching strategy**: All Pokemon data cached in IndexedDB with 24-hour TTL. App fetches from cache first, falls back to API only on cache miss. Hardcoded fallback data (~90 Pokemon) available for fully offline use.
- **Alert threshold**: N/A (free API, but request counter logs warn if >50 requests per session to catch bugs)
- **Last reviewed**: 2026-03-27

# Gallery deployment

Run commands from the repository root. Build and preview the gallery with
`bun run site:build` and `bun run site:dev`; publish with `bun run site:deploy`,
which runs `bun run check` first.

The gallery is the `balebase-continuity` Worker with static assets, in
Balebase's Cloudflare account. Set `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` for that account in Wrangler's environment only; never
print or commit them. `src/site/` builds the page from the committed
`genesis/` snapshot, `site/` holds its stylesheet, headers, and robots.txt,
and the build renders `favicon.svg`, `favicon.ico`, and `apple-touch-icon.png`
from `assets/brand/logo.svg` with the `favicons` target in `agent-tool.json`
(`agent-tool images build favicons --out dist`); rendered icons are never
committed.

The page and every asset carry `X-Robots-Tag: noindex, nofollow, noarchive`
and a robots meta tag, while `robots.txt` allows crawling so crawlers can see
those directives. `workers.dev` and preview URLs are disabled.

## Hostname

The hostname `continuity.balebase.com` belongs to Balebase's Terraform
(`terraform/stacks/prod` in [a2f0/balebase](https://github.com/a2f0/balebase)),
which attaches it to this Worker with a `cloudflare_workers_custom_domain`, as
it does for Balebase's own Workers. Publish the Worker here first, then plan
and apply the hostname there. Later asset deployments need only Wrangler.

## Verification

After an authorized deployment from reset `main`, prove the live index matches
the built artifact and that responses still carry the `noindex` header. Tests
check `_headers` in the build; only the live response shows that Cloudflare
applied it.

```sh
curl -fsS https://continuity.balebase.com/ | cmp - dist/index.html
for page in / /genesis/manifest.json; do
  curl -fsSI "https://continuity.balebase.com$page" |
    grep -i '^x-robots-tag: noindex' || echo "missing noindex: $page"
done
```

CI does not publish the gallery. Deploy after merging a change to `genesis/`,
`src/site/`, `site/`, `assets/brand/`, the `images` section of
`agent-tool.json`, or `wrangler.jsonc`.

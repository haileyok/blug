# Blug - An ATProtocol Blog

A simple little blog that pulls posts from your PDS, using the `site.standard.document` lexicon (the [standard.site](https://standard.site) long-form publishing schema). Uses Redis to keep them
cached for a bit, in case you're popular and don't want to be constantly polling your PDS.

## standard.site Compliance

This blog implements the full [standard.site verification handshake](https://standard.site/docs/verification):

- **`/.well-known/site.standard.publication`** — serves the AT-URI of your
  `site.standard.publication` record as `text/plain`, tying your domain to the record.
- **Document link tags** — every `/posts/{rkey}` page emits
  `<link rel="site.standard.document" href="at://{DID}/site.standard.document/{rkey}">`
  and `<link rel="site.standard.publication" href="...">`, so crawlers (including
  Bluesky's enhanced link cards) can resolve posts back to their records.

For this to validate, your repo needs the records — create them with whatever
standard.site-compatible client you use (Leaflet, Offprint, pckt.blog, or
[the quick start](https://standard.site/docs/quick-start)):

1. A `site.standard.publication` record (rkey `self` is the convention) with
   `url` set to your blog's origin — e.g. `https://your.blog`, **no trailing slash**.
2. `site.standard.document` records with required fields `site`, `title`,
   `publishedAt`, and `path` like `/posts/{rkey}` pointing at this blog's routes.

Once the blog is running, validate the whole handshake end-to-end:

```shell
yarn validate:standard-site
```

The script checks the well-known endpoint, the publication record, every
document record against the lexicon's required fields, and the link tags
rendered on the post pages. It exits non-zero on any failure. Set `BASE_URL`
to validate a deployed instance.

## Leaflet Support

This blog now uses [Leaflet](https://leaflet.pub), a block-based document format for ATProtocol. Instead of simple markdown content, posts are composed of structured blocks that support rich formatting and embedded content.

### Supported Block Types

- **Text blocks** with rich text formatting (bold, italic, strikethrough, code, links)
- **Header blocks** (levels 1-6) with automatic styling
- **Image blocks** with aspect ratios and alt text
- **Blockquote blocks** for quoted content
- **Code blocks** for syntax highlighting
- **Website cards** with preview images and metadata
- **Embedded Bluesky posts** using the official embed widget
- **Horizontal rules** for visual separation

### Image Handling

Images are served via Bluesky's CDN with proper URLs constructed from the DID and blob reference:
```
https://cdn.bsky.app/img/feed_fullsize/plain/{did}/{blobRef}@jpeg
```

## Configuration

Just a few things are needed in your `.env` file.

```shell
ATP_SERVICE=https://pds.haileyok.com/
ATP_IDENTIFIER=haileyok.com
ATP_DID=did:plc:oisofpd7lj26yvgiivf3lxsi
```

- `ATP_SERVICE` is the URL of your PDS. It's probably hosted by Bluesky. Find it at [internect.info](https://internect.info).
- `ATP_IDENTIFIER` is your handle. It's used to know which repo to get records from.
- `ATP_DID` is...your DID. Again, find it at [internect.info](https://internect.info). Used to get your Bluesky profile
  (I use this just to get the already-hosted copy of your profile picture. You could rewrite this if you wanted to, would
  be faster too).

You also need to have Redis running. I didn't bother adding configuration for it, so if you want to change where it's
hosted at check `src/redis/redis.ts`.

```shell
# macos
brew install redis
brew services start redis

# ubuntu
sudo apt-get install redis-server
sudo systemctl start redis

# centos
sudo yum install redis
sudo systemctl start redis
```

## Development

Just run the vite server, you know, like usual?

```shellscript
yarn run dev
```

## Deployment

### Docker (recommended)

The easiest way to run Blug is with Docker Compose, which spins up both the app
and a Redis cache together.

1. Copy the example env file and fill in your ATProtocol values:

   ```shell
   cp .env.example .env
   # edit .env with your ATP_SERVICE, ATP_IDENTIFIER, and ATP_DID
   ```

2. Build and start everything:

   ```shell
   docker compose up -d --build
   ```

The app will be available at `http://localhost:3000`.

To stop:

```shell
docker compose down
```

### Manual

Make sure you have `dotenv-cli` installed.

```shell
npm install -g dotenv-cli
```

Then build and serve.

```
yarn build
yarn start
```

## CI/CD

On every push to `main`, a GitHub Actions workflow builds the Docker image and
publishes it to the GitHub Container Registry at
`ghcr.io/haileyok/blug`. The image is tagged with both `latest` and the commit
SHA. No additional secrets are required — the workflow uses the built-in
`GITHUB_TOKEN` with `packages:write` permission.

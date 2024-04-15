# Blug - An ATProtocol Blog

A simple little blog that pulls posts from your PDS, using the `com.whtwnd.blog.entry` lexicon. Uses Redis to keep them
cached for a bit, in case you're popular and don't want to be constantly polling your PDS.

```ts
interface WhtwndBlogEntryRecord {
  $type: 'com.whtwnd.blog.entry'
  content?: string
  createdAt: string
  theme?: string
  title: string
  ogp?: {
    height: number | null
    url: string | null
    width: number | null
  }
}

interface WhtwndBlogEntryView {
  rkey: string
  cid: string
  title: string
  content?: string
  createdAt: string
  banner?: string
}
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

Make sure you have `dotenv-cli` installed.

```shell
npm install -g dotenv-cli
```

Then build and serve.

```
yarn build
yarn start
```

## Creating Posts

There's various ways you could do this. I just use a Markdown editor and then manually save them with `createRecord`.
You can also use the editor at [whtwnd's website](https://whtwnd.com/edit) to create them.

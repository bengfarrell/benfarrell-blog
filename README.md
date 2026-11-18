# eleventy-base-blog v8

A starter repository showing how to build a blog with the [Eleventy](https://www.11ty.dev/) site generator (using the [v2.0 release](https://www.11ty.dev/blog/eleventy-v2/)).

## Getting Started

* [Want a more generic/detailed getting started guide?](https://www.11ty.dev/docs/getting-started/)

1. Make a directory and navigate to it:

```
mkdir my-blog-name
cd my-blog-name
```

2. Clone this Repository

```
git clone https://github.com/11ty/eleventy-base-blog.git .
```

_Optional:_ Review `eleventy.config.js` and `_data/metadata.js` to configure the site’s options and data.

3. Install dependencies

```
npm install
```

4. Run Eleventy

Generate a production-ready build to the `_site` folder:

```
npx @11ty/eleventy
```

Or build and host on a local development server:

```
npx @11ty/eleventy --serve
```

Or you can run [debug mode](https://www.11ty.dev/docs/debugging/) to see all the internals.

## Bluesky comments

To enable comments on an individual article, share it on Bluesky and add the
resulting post URL to the article's YAML front matter:

```yaml
blueskyComments: "https://bsky.app/profile/your-handle.bsky.social/post/post-id"
```

Posts without this field keep the existing email/Bluesky message. Invalid URLs
fail the build. A profile URL using a DID also works and remains stable if the
account's handle changes.

Visitors choose **Load comments** before the browser contacts Bluesky's public
API; no credentials, backend, or rebuilds are needed to fetch new replies.
JavaScript is required to display replies on the blog, but the conversation link
always works. Posting replies happens on Bluesky and requires a Bluesky account.
Use **Refresh comments** to fetch updates.

Replies are displayed as plain text, oldest first within each thread, up to 200
entries and six levels deep. Attachments link back to Bluesky. Quotes and other
posts merely linking to the article are not included. Comments are excluded from
Pagefind indexing.

Blocked/deleted replies and replies with post or author moderation labels are
replaced with placeholders; their descendants are omitted. This public,
unauthenticated view does not inherit your account's personal mutes, blocks, or
moderation preferences. Review the conversation on Bluesky and remove the front
matter field to disable comments on an article. Loading comments shares the
visitor's IP address with Bluesky.

Run the comments checks with `node --test tests/bluesky-comments.test.js`.

## Monthly media manager and Lowdown

`/media/` uses [Monthly](https://github.com/bengfarrell/monthly) for a
single-user, password-protected uploader, microblog composer, and month-filtered
media library for images, audio, and videos. Files upload directly to an
existing S3 bucket, with multipart
uploads for files over 100 MiB and a 2 GiB per-file limit. The API assigns
`<prefix>YYYY/MM/<sanitized-filename>` keys and returns public media URLs.
Uploading the same sanitized filename to the same month replaces that object.
The **Post** tab publishes short updates with optional media and tags, including
hashtags parsed from the message. Posts always use the current UTC month and
append to `<prefix>YYYY/MM/posts.json`. Regular uploads retain their month picker.
Monthly does not convert videos or modify the bucket policy.

`/lowdown/` is the public feed, not yet linked in the site navigation. It reads
the current month and previous two months directly from the existing CDN at
runtime, with month headings and a responsive one-to-three-column layout.
Missing JSON files are skipped with a console warning, not a feed error.
Publishing an update does **not** require rebuilding or redeploying Eleventy.

The page asks only for your username and password. Its API URL and bucket are
fixed by the `API_URL` and `BUCKET` constants in `_data/media.js`; `FEED_URL`
sets the public CDN URL including the upload prefix. No frontend
environment variables are required. This repository is only a static client
of Monthly's library and services. Backend implementation, AWS configuration,
and deployment are maintained in the
[Monthly repository](https://github.com/bengfarrell/monthly).
Sign-in supports browser/password-manager autofill; credentials are never
saved by the app.
Browse, Upload, and Post are separate tabs; switching tabs keeps upload progress and
library filters intact.
Node.js 22.12 or newer is required;
`nvm use` selects the version in `.nvmrc`. Monthly's browser assets are copied automatically
by Eleventy for both `npm run build` and `npm start`.
`npm run build:media` copies only the browser assets and site-specific CSS.
Site builds do not package or deploy any backend infrastructure.

Run the Monthly client integration checks:

```sh
npm run test:media
```

### Updating the Monthly package

Monthly is pinned to the checked-in
`vendor/bengfarrell-monthly-0.1.0.tgz` npm archive. A fresh checkout only needs
`npm install`; neither npm publishing nor a sibling Monthly checkout is required
to build this site. Only the package's browser assets and client-side APIs are
used here.

To update, run `npm pack --pack-destination /path/to/benfarrell-blog/vendor`
from the Monthly project, then run
`npm install --save-dev ./vendor/<new-archive-name>.tgz` in this project.
Use a new package version/archive name for each update, and commit the archive
and `package.json` together. Generated browser assets and
`_site` remain ignored. The package does not contain local `.env` files.

## Features

- Using [Eleventy v2.0](https://www.11ty.dev/blog/eleventy-v2/) with static output and optional client-side enhancements.
	- Articles are pre-rendered; opt-in Bluesky comments load in the browser.
	- Can easily [deploy to a subfolder without changing any content](https://www.11ty.dev/docs/plugins/html-base/)
	- All URLs are decoupled from the content’s location on the file system.
	- Configure templates via the [Eleventy Data Cascade](https://www.11ty.dev/docs/data-cascade/)
- **Performance focused**: four-hundos Lighthouse score out of the box!
	- [View the Lighthouse report for the latest build](https://eleventy-base-blog.netlify.app/reports/lighthouse/) courtesy of the [Netlify Lighthouse plugin](https://github.com/netlify/netlify-plugin-lighthouse).
	- _0 Cumulative Layout Shift_
	- _0ms Total Blocking Time_
- Local development live reload provided by [Eleventy Dev Server](https://www.11ty.dev/docs/dev-server/).
- Content-driven [navigation menu](https://www.11ty.dev/docs/plugins/navigation/)
- [Image optimization](https://www.11ty.dev/docs/plugins/image/) via the `{% image %}` shortcode.
	- Zero-JavaScript output.
	- Support for modern image formats automatically (e.g. AVIF and WebP)
	- Prefers `<img>` markup if possible (single image format) but switches automatically to `<picture>` for multiple image formats.
	- Automated `<picture>` syntax markup with `srcset` and optional `sizes`
	- Includes `width`/`height` attributes to avoid [content layout shift](https://web.dev/cls/).
	- Includes `loading="lazy"` for native lazy loading without JavaScript.
	- Includes [`decoding="async"`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decoding)
	- Images can be co-located with blog post files.
	- View the [Image plugin source code](https://github.com/11ty/eleventy-base-blog/blob/main/eleventy.config.images.js)
- Per page CSS bundles [via `eleventy-plugin-bundle`](https://github.com/11ty/eleventy-plugin-bundle).
- Built-in [syntax highlighter](https://www.11ty.dev/docs/plugins/syntaxhighlight/) (zero-JavaScript output).
- Blog Posts
	- Draft posts: use `draft: true` to mark a blog post as a draft. Drafts are **only** included during `--serve`/`--watch` and are excluded from full builds. View the [Drafts plugin source code](https://github.com/11ty/eleventy-base-blog/blob/main/eleventy.config.drafts.js).
	- Automated next/previous links
	- Accessible deep links to headings
- Generated Pages
	- Home, Archive, and About pages.
	- [Feeds for Atom and JSON](https://www.11ty.dev/docs/plugins/rss/)
	- `sitemap.xml`
	- Zero-maintenance tag pages ([View on the Demo](https://eleventy-base-blog.netlify.app/tags/))
	- Content not found (404) page

## Demos

- [Netlify](https://eleventy-base-blog.netlify.com/)
- [GitHub Pages](https://11ty.github.io/eleventy-base-blog/)
- [Remix on Glitch](https://glitch.com/~11ty-eleventy-base-blog)
- [Cloudflare Pages](https://eleventy-base-blog-d2a.pages.dev/)

## Deploy this to your own site

Deploy this Eleventy site in just a few clicks on these services:

- [Get your own Eleventy web site on Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/11ty/eleventy-base-blog)
- If you run Eleventy locally you can drag your `_site` folder to [`drop.netlify.com`](https://drop.netlify.com/) to upload it without using `git`.
- [Get your own Eleventy web site on Vercel](https://vercel.com/import/project?template=11ty%2Feleventy-base-blog)
- [Try it out on Stackblitz](https://stackblitz.com/github/11ty/eleventy-base-blog)
- Read more about [Deploying an Eleventy project](https://www.11ty.dev/docs/deployment/) to the web.

### Implementation Notes

- `content/about/index.md` is an example of a content page.
- `content/blog/` has the blog posts but really they can live in any directory. They need only the `posts` tag to be included in the blog posts [collection](https://www.11ty.dev/docs/collections/).
- Use the `eleventyNavigation` key (via the [Eleventy Navigation plugin](https://www.11ty.dev/docs/plugins/navigation/)) in your front matter to add a template to the top level site navigation. This is in use on `content/index.njk` and `content/about/index.md`.
- Content can be in _any template format_ (blog posts needn’t exclusively be markdown, for example). Configure your project’s supported templates in `eleventy.config.js` -> `templateFormats`.
- The `public` folder in your input directory will be copied to the output folder (via `addPassthroughCopy` in the `eleventy.config.js` file). This means `./public/css/*` will live at `./_site/css/*` after your build completes.
- Provides two content feeds:
	- `content/feed/feed.njk`
	- `content/feed/json.njk`
- This project uses three [Eleventy Layouts](https://www.11ty.dev/docs/layouts/):
	- `_includes/layouts/base.njk`: the top level HTML structure
	- `_includes/layouts/home.njk`: the home page template (wrapped into `base.njk`)
	- `_includes/layouts/post.njk`: the blog post template (wrapped into `base.njk`)
- `_includes/postslist.njk` is a Nunjucks include and is a reusable component used to display a list of all the posts. `content/index.njk` has an example of how to use it.

#### Content Security Policy

If your site enforces a [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) (as public-facing sites should), you have a few choices (pick one):

1. In `base.njk`, remove `<style>{% getBundle "css" %}</style>` and uncomment `<link rel="stylesheet" href="{% getBundleFileUrl "css" %}">`
2. Configure the server with the CSP directive `style-src: 'unsafe-inline'` (less secure).

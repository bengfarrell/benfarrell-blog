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

## Portfolio homepage

The homepage lives in `content/index.njk`. Its `selectedWork` front matter
controls the three featured examples, including images, links, and short descriptions.
Each example has a `moreUrl` and `moreLabel` linking to its category: Adobe work
at `/work/adobe/`, museum installations at `/work/installations/`, and public
speaking and teaching at `/speaking-engagements/`. Adobe work and installation examples are
curated in `content/work/adobe.md` and `content/work/installations.md`, with a
heading, short description, local image, and link for each project.
These pages, the combined speaking and teaching page, and the full work history
at `/positions-held/`, plus awards and patents at `/awards/`, set `workEntries: true`
to share full-width dividers and consistent entry spacing. Use a Markdown
horizontal rule (`---`) between entries; the styles are scoped to these pages.
Speaking and teaching entries are newest first, with repeated talks grouped by
their most recent appearance and undated user-group talks at the end.
The standalone `/teaching/` page is removed; the homepage links directly to the
combined page's `#intro-to-vr` entry.
Run the entry and navigation checks with `node --test tests/work-pages.test.js`.
The recent writing section automatically shows the three newest posts in the
`blog` category.

The blog archive at `/blog/` uses the shared page heading and wave, with scoped
`.blog-index` styles for thumbnail rows, wrapping titles, and muted publication
dates. Its `blogIndex: true` flag enables semantic headings and dates in the
shared post-list template without changing the older portfolio lists.
Pagination retains ten posts per page and the existing archive URLs; Newer and
Older navigate through the reverse-chronological list.

Homepage styles are in `public/css/home.css`, loaded only when `homepage: true`
is set. Shared typography and navigation remain in `public/css/index.css` and
`_includes/layouts/base.njk`. The header links to Resume, Blog, and Search;
the Ben Farrell name links home.

Page and blog-post titles share the `.entry-header-single` styles in
`public/css/index.css`: left-aligned with the content, responsive sizing, and
a subtle blue wave beneath the title that follows its width.
The homepage title shares the wave decoration, with its own typography and layout.

Featured project images are stored in `public/images/work/` and referenced as
`/images/work/...`, rather than hotlinked. The image shortcode resolves these
site-root URLs against `public/`; content-relative image paths still work.
Premiere Color Mode and Firefly Design imagery comes from their Adobe product
pages. MAX Sneaks, installation, and speaking photos were copied from the site's
existing image archive. The local copies are WebP, capped at 1400 pixels wide
without upscaling. New work examples should also include a local image.

Run the local image path checks with `node --test tests/images.test.js`.

## Resume

`content/resume.md` is a self-contained resume with selected experience,
capabilities, recognition, and contextual links to the detailed archives.
Adobe experience is consolidated into one Design Engineer role (2015-present);
the full work history keeps the separate Design Lab period.
The full work history retains the resume's experience bullets alongside
additional project details and individual earlier roles. Update both pages when
changing shared experience wording; the work-page checks enforce consistency.
Its Community & independent work section also incorporates the former affiliations
archive, including the video series and museum installations. The old
`/affiliations/` page has been removed without a redirect.
It sets `pageHeading` to display the name independently of the browser title.
`resumePage: true` loads `public/css/resume.css` and `public/js/resume.js`;
other pages keep their existing layout and styles.
The standalone `/skills/` inventory is removed; capabilities live on the resume.
Retired pages are removed rather than kept as redirects.

Download PDF links directly to `/resume/Ben-Farrell-Resume.pdf`, served from the
checked-in binary at `public/resume/Ben-Farrell-Resume.pdf`.
`npm run start` generates a fresh PDF with `scripts/build-resume-pdf.js` after the
initial development build, then saves it back to `public`.
It generates once per server start, not on every watched edit. Restart the server
after resume or print-style changes to refresh the PDF before committing.
The generated file is ignored by the watcher to avoid a rebuild loop.
Commit the updated PDF alongside resume content or print-style changes.
It uses the rendered resume and existing print styles, and embeds clickable
public contact, project, and book links. Scripts and network access are disabled
during generation.

The separate Print button opens the browser/OS print dialog and stays hidden
when JavaScript is unavailable; the PDF download needs no JavaScript. Both
formats hide navigation, the footer, and archive-navigation links, while keeping
the resume's content and contact details.

Production builds (`npm run build`) only copy the checked-in PDF; they never
launch Chrome and fail if the source PDF is missing. Puppeteer's automatic
browser download is disabled, so Netlify needs no browser installation.
Local development on macOS uses an installed Google Chrome. On other platforms,
install the development browser explicitly with
`npx puppeteer browsers install chrome` before starting the server.
Local browser or PDF rendering errors fail the development build explicitly.

Run the resume and embedded PDF link checks with `npm run test:resume`.

## Search and sharing

`eleventy.config.seo.js` supplies branded browser titles, distinct paginated titles,
absolute canonical URLs, and matching search/Open Graph/Twitter descriptions.
Explicit page descriptions take priority; otherwise descriptions are derived from
rendered body paragraphs, excluding navigation, code blocks, and comments.
Visible headings remain independent of browser titles.
Repeated article titles are distinguished in search metadata using their
publication dates; the visible article headlines remain unchanged.

Identity and professional profile links are defined in `_data/metadata.js`.
JSON-LD describes the person and website, the homepage as a profile, and posts as
articles with their real publication dates. It deliberately omits modification
dates rather than treating every rebuild as a content update.

`/sitemap.xml` lists current collection pages, including all blog archive pages.
Search, the 404 page, feeds, and excluded collections are omitted. `/robots.txt`
permits crawling and points to the sitemap. Set `noindex: true` to opt a page out
of indexing, and `sitemap: false` to omit a collection page from the sitemap.

`scripts/build-social-image.js` generates `/images/social-preview.png` during
filesystem builds, using `_includes/social-preview.svg.njk` and the existing
portrait. The default card is 1200 by 630; posts retain their own cover images
unless the cover is an SVG. Keep the card copy aligned with the homepage bio.

Run `npm run test:seo` for metadata, structured data, sitemap, and PNG checks.
After deployment, submit `/sitemap.xml` in Google Search Console and inspect the
homepage and resume URLs. Verify that retired URLs return HTTP 404; uploading
new files alone does not necessarily remove old files from the hosting origin.
Search Console verification and deployment are managed outside this build.

## External links

HTML pages automatically open off-site HTTP(S) links in a new tab with
`rel="noopener"`, preserving any existing `rel` values. Links to this site,
section anchors, email links, and other non-web protocols are left unchanged.
This applies to both Markdown content and HTML templates without requiring
per-link attributes. Bluesky comment links use the same new-tab behavior.

Run the link checks with `node --test tests/external-links.test.js`.

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

## Monthly media manager and Memos

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

`/memos/` is the public feed, linked from the homepage preview and media manager.
`/lowdown/` and `/notes/` redirect to `/memos/`, preserving month queries and
post anchors with JavaScript, with a static HTML redirect and fallback link
when JavaScript is unavailable.
The feed reads
the current month and previous two months directly from the existing CDN at
runtime, with month headings and a responsive one-to-three-column layout.
The site feed element sets `container-type: inline-size` so Monthly's existing
46rem/two-column and 70rem/three-column container queries work with the subclass.
`client/monthly-site.css` supplies site typography, muted dates/tags, light card
borders, and a 75rem page width; the heading reuses the site's blue wave.
Deep links scroll the memo's beginning below the fixed header and focus it for
accessibility, without adding a selection outline or highlight.
No Monthly source changes are needed for this styling.
Missing JSON files are skipped with a console warning, not a feed error.
Publishing an update does **not** require rebuilding or redeploying Eleventy.

Monthly's optional `thumbnails` maps are preserved when reading the feed.
Inline images use the first thumbnail, falling back to the original for older
posts. Videos with a thumbnail (or legacy `poster`) show that poster with
`preload="none"`; videos without one retain `preload="metadata"`.
The upgraded media manager includes image thumbnail controls, video frame
selection, and the monthly posts JSON editor. Image thumbnails default on above
1 MiB; new thumbnails do not automatically backfill older posts.
Originals and thumbnails use the existing upload/sign endpoints. Associations
are stored only in memo entries in `posts.json`; no `/thumbnails` API route or
thumbnail-index permissions are required. The media library lists originals,
generated thumbnails, and legacy posters as independent media files. Deploy
Monthly's updated Lambda to get this listing behavior; old `thumbnails.json`
indexes are ignored. This site update does not deploy backend changes.

Memos adds a small **Expand** button for every image, video, and audio attachment.
Images also open when clicked/tapped. `public/js/memo-viewer.js` enhances Monthly's
rendered media without changing its library source or inline playback controls.
The shared native modal dialog constrains media to the viewport, traps keyboard
focus, and closes with its button, Escape, or a backdrop click. Focus returns to
the expand button on close. Expanded images and **Open original** always use
the original media URL, not the inline thumbnail; expanded videos retain their
poster. Images retain natural sizing; video/audio keep native
controls, do not autoplay, and preserve the playback position between inline and
expanded views. Opening pauses the inline player; closing stops the expanded
player without automatically resuming playback. An **Open original** link is
available for unsupported formats, with visible errors if media fails to load.
The viewer and controls are styled in `client/monthly-site.css`; the homepage
preview remains unchanged.
Run viewer checks with `node --test tests/memo-viewer.test.mjs` (also included
in `npm run test:media`).

The homepage's **This month** section sits below Recent writing.
`public/js/notes-preview.js` fetches only the current UTC month's JSON, reusing
Monthly's post validation, and shows the two newest non-future entries as plain
text excerpts of at most 140 characters. Each excerpt links to its full post
at `/memos/?month=YYYY-MM#note-UUID`. `public/js/notes-feed.js` extends Monthly's
feed to load the linked month (including older months), assign post anchors,
and scroll to and focus the requested post after loading.
Media-only posts get a text label. Posts with an image show one 44px preview
using its first generated thumbnail when available, otherwise the original;
otherwise video/audio attachments use local muted icons without requesting
the associated media. Full players stay on Memos. The month and dates use UTC, matching
publication. The preview stays hidden without JavaScript, for empty months,
or if the request fails (failures are logged to the console). It loads no Monthly
UI or styles and is excluded from Pagefind. New updates need no site rebuild.
Run its checks with `node --test tests/notes-preview.test.mjs tests/notes-feed.test.mjs`.

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
`vendor/bengfarrell-monthly-0.1.1.tgz` npm archive, built from the local Monthly
source with post-only thumbnail associations. A fresh checkout only needs
`npm install`; neither npm publishing nor a sibling Monthly checkout is required
to build this site. Only the package's browser assets and client-side APIs are
used here.

The archive is the install source, not just a backup: `npm install` extracts it
into `node_modules`. Site builds then copy the installed browser assets; they
do not extract the archive again or rebuild Monthly.

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

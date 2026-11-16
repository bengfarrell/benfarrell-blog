# Private S3 media manager

The static `/media/` page uses Uppy to upload directly to S3. Enter your
username/password in the page's sign-in form. Each API request sends Basic
authorization over HTTPS; Lambda checks it against its environment variables
before listing files or authorizing uploads. There is no Cognito account,
OAuth redirect, authentication database, or saved browser login.

| Route | Purpose |
| --- | --- |
| `GET /media?bucket=site-one-media&month=2026-11&cursor=...` | List up to 50 objects inside that bucket's configured prefix; month is optional |
| `POST /uploads` | JSON includes `bucket`, filename/type/size, and optional month |
| `POST /sign` | JSON includes `bucket`, key, ticket, and the upload operation |

All three routes require credentials. Uploads additionally require a signed
grant lasting 24 hours; individual S3 URLs last five minutes. Signed content
lengths constrain single uploads and each multipart part to the declared
sizes. The grant-signing key is derived internally from the configured
credentials, so changing either credential invalidates outstanding grants.
Credentials are not sent to S3 and never appear in public configuration.
One login can manage all allowed buckets. Bucket names come from the frontend,
but prefixes, public URLs, and regions come only from Lambda's allowlist.
Grants are bound to the bucket, prefix, and region; they cannot be moved to
another bucket even when both buckets use the same prefix.

## 1. Create the Lambda in the AWS console

Choose **Lambda > Create function > Author from scratch**, Node.js 22.x,
x86_64, and a new execution role with basic Lambda permissions. Set its timeout
to 20 seconds and memory to 256 MiB. Lambda can run in one region while
uploading to buckets in different regions; each bucket's region is configured
below.

From the repository root, install the build dependencies with `npm install`,
then run `npm run build:media`. This builds the frontend and creates
**`dist/media-lambda.zip`**. The ZIP is also generated automatically by
`npm run build` and `npm start`. To package only Lambda without building the
frontend or site, run `npm run build:media-api`.

In Lambda's **Code > Upload from > .zip file**, choose `dist/media-lambda.zip`
and save. In **Code > Runtime settings**, set the handler to `handler.handler`.
The ZIP contains a single root-level `handler.mjs`, with the shared media
types and AWS SDK dependencies bundled inside. No separate `node_modules`
upload, SAM, or local Lambda runtime is needed. Credentials and bucket settings
are read from Lambda's environment at runtime, not included in the ZIP.
Uploading code does not change the environment variables you already set.
The ZIP is kept outside the public site output and ignored by Git.

In **Configuration > Permissions**, open the execution role and add an
inline IAM policy granting only the approved buckets/prefixes. For the
example mapping below:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::site-one-media",
      "Condition": { "StringLike": { "s3:prefix": "media/*" } }
    },
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:AbortMultipartUpload", "s3:ListMultipartUploadParts"],
      "Resource": "arn:aws:s3:::site-one-media/media/*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::site-two-media",
      "Condition": { "StringLike": { "s3:prefix": "uploads/*" } }
    },
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:AbortMultipartUpload", "s3:ListMultipartUploadParts"],
      "Resource": "arn:aws:s3:::site-two-media/uploads/*"
    }
  ]
}
```

Replace the example names and prefixes with your actual values. Do not grant
access to all S3 buckets. Adding a bucket requires updating both the allowlist
and this IAM policy.

Choose the prefix deliberately: the Lambda role can browse and upload only
inside it, including older files there. Uploads use the server's current UTC
year/month unless you select a different upload month. S3 prefixes do not
require separate folder creation.

There are ongoing AWS charges for S3 storage/transfers/requests and API/Lambda
use. Cross-region uploads/signing can add latency and transfer costs.

Each `publicBaseUrl` must map to its bucket root. If CloudFront has an
`OriginPath` that already prepends `wp-content/uploads`, use a separate
root-mapped origin/distribution or adjust that mapping before using this app;
otherwise generated URLs would duplicate the prefix.

If your bucket uses a customer-managed KMS key, add narrowly scoped
`kms:GenerateDataKey` and `kms:Decrypt` permissions to the Lambda role and
authorize it in the key policy. Restrictive bucket policies must also allow
this role. The default template assumes ordinary S3-managed encryption.

## 2. Set credentials directly on Lambda

Open **Configuration > Environment variables > Edit** and add:

| Variable | Value |
| --- | --- |
| `MEDIA_USERNAME` | Your chosen username, 1-128 characters, without a colon or newline |
| `MEDIA_PASSWORD` | A strong, unique password, 16-1024 characters, without a newline |
| `MEDIA_BUCKETS` | JSON mapping approved bucket names to their prefix, public URL, and region |

Example `MEDIA_BUCKETS` value (replace with your actual buckets):

```json
{
  "site-one-media": {
    "prefix": "media/",
    "publicBaseUrl": "https://site-one.cloudfront.net",
    "region": "us-west-2"
  },
  "site-two-media": {
    "prefix": "uploads/",
    "publicBaseUrl": "https://site-two.cloudfront.net",
    "region": "us-east-1"
  }
}
```

Prefixes must end in `/`; public URLs must be HTTPS origins with no path,
query, or credentials. Every entry must have an explicit region.
Missing/unknown bucket names are rejected; the API does not fall back to
another bucket. Invalid allowlist configuration fails closed.
The old `MEDIA_BUCKET`, `MEDIA_PREFIX`, and `MEDIA_PUBLIC_BASE_URL` Lambda
variables are no longer used. Keep the complete allowlist and other environment
values within Lambda's total 4 KiB environment-variable limit.

Use a long random password; there is no account lockout or managed password
recovery. API Gateway throttling limits request volume but is not a complete
brute-force defense. Lambda environment variables are encrypted at rest, but
people with sufficient AWS permissions can still read them.

The credentials are deliberately absent from the SAM template, repository,
site build settings, and static output. Until valid credentials are configured,
the API fails closed with a configuration error.

**Recheck/reapply these two variables after every SAM/CloudFormation update.**
Because the stack manages the function's other environment variables, an
update can replace console-added values. Do not accidentally replace the
whole environment map when editing it manually.

Changing the username/password requires no site rebuild. It rejects old
credentials and old upload grants once the function configuration update
has completed. S3 URLs that were already signed can still work until their
five-minute expiration. Avoid rotating credentials mid-upload.

## 3. Connect API Gateway

Create an **HTTP API** in API Gateway in the Lambda function's region (not a
REST API). Add a Lambda integration with payload format **2.0** and these
routes: `GET /media`, `POST /uploads`, and `POST /sign`. Use the `$default`
stage with automatic deployment so its invoke URL has no stage path.
Let the console add permission for API Gateway to invoke the function.

Do not add a Cognito/JWT authorizer; the handler checks Basic authorization.
Configure API CORS to allow each frontend origin, methods GET/POST/OPTIONS,
and headers Authorization/Content-Type. Add a default-stage throttle, for
example a 5 requests/second rate and burst of 10. Do not enable access logging
of Authorization headers or request bodies.

## 4. Configure each bucket

Use the S3 console to **merge** these rules with existing CORS rules rather
than replacing other applications' configuration:

```json
[
  {
    "AllowedOrigins": ["https://benfarrell.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 600
  }
]
```

Use the relevant frontend origins for each bucket. `ETag` must be exposed for multipart
uploads. DELETE is used only to abort incomplete multipart uploads; the
Lambda role does not have permission to delete completed objects.
CORS is not authentication.

Also add/merge a lifecycle rule to abort incomplete multipart uploads after
one day, filtered to the media prefix. This cleans up abandoned uploads when
the browser closes or a network interruption prevents cancellation:

```json
{
  "ID": "Abort-incomplete-media-uploads",
  "Status": "Enabled",
  "Filter": { "Prefix": "media/" },
  "AbortIncompleteMultipartUpload": { "DaysAfterInitiation": 1 }
}
```

The app does not change read permissions. If the bucket is private behind
CloudFront, allow the distribution's origin access to the selected prefix.
Do not enable public `ListBucket` or public write access. For public media,
set suitable CDN cache/security headers, including
`X-Content-Type-Options: nosniff`. Filenames are unique so replacing cached
assets is unnecessary.

## 5. Configure and deploy each static page

Run `npm start` and open `http://localhost:8080/media/`, or run `npm run build`
and deploy `_site` with your normal site deployment. No frontend environment
variables are required. The sign-in form asks only for your Lambda
username/password. Each site's API URL and bucket name are fixed in
`_data/media.js`:

```js
const API_URL = "https://n3rnxs3qyh.execute-api.us-east-1.amazonaws.com";
const BUCKET = "wp-uploads-bf";
```

For another blog, change its `BUCKET` constant to that site's bucket. Keep the
same `API_URL` to share this Lambda. The bucket must be in Lambda's
`MEDIA_BUCKETS` allowlist and execution-role policy, with that site's origin
allowed by API Gateway and S3 CORS. Use the bucket name only, not its folder
prefix. Lambda selects the configured prefix, public URL, and
region and rejects buckets outside its allowlist.

Only configure an API URL you trust: the page sends your credentials to that
endpoint. The API URL must be an HTTPS origin with no path, query, or embedded
credentials. A local HTTP frontend is supported, but its API still uses HTTPS.
Add the local origin to both API Gateway and S3 CORS when developing locally.

These settings are **public, non-secret** and emitted as `/media/config.json`.
Changing either constant requires rebuilding and deploying the static site.
Invalid URLs or bucket names fail the build. Frontend `MEDIA_API_URL` and
`MEDIA_BUCKET` environment variables are no longer used. Never set the
username/password as site build variables or insert them into JavaScript.

Open `https://benfarrell.com/media/`, enter your credentials, and upload a
small image or audio file first. Confirm its public link, then upload a file
over 100 MiB to exercise multipart uploading. Clear the browse month for all
files in the prefix; use **Load more** for subsequent pages. The **Browse** tab
opens after sign-in; the **Upload** tab contains the uploader and completed
URLs. Switching tabs preserves filters, library results, and upload progress;
uploads continue while browsing. Use Left/Right arrows or Home/End to navigate
the tabs with the keyboard.

## Behavior and limits

- Supports JPEG, PNG, GIF, WebP, AVIF, HEIC/HEIF, MP4/M4V, WebM, and MOV,
  from 1 byte to 2 GiB per file, up to 20 files in the uploader.
- Audio support includes MP3, WAV, M4A, AAC, OGG/OGA/Opus, FLAC, AIFF/AIF,
  and audio WebM (`.weba`). The library uses native audio playback controls;
  unsupported formats/codecs are still available via their links.
- The explicit acceptance list is shared by the browser and Lambda in
  `media-types.mjs`. Unlisted formats (including PDF, ZIP, MIDI, SVG, and
  project files) are rejected. Add formats there, then rebuild the site and
  redeploy Lambda together.
- Type/extension checks are not malware scanning or codec validation.
  Uploading does not transcode media or create poster images.
- Files over 100 MiB use fixed 10 MiB parts with retry support.
  Keep the page open: reload/resume across sessions is not implemented.
- The library lists the selected bucket's S3 keys in lexical order, not newest-first.
  New files use unique keys; existing filenames/URLs are unchanged.
- Credentials exist only in the current page's memory. Input fields are
  cleared after submitting; signing out or reloading requires re-entry.
  The app does not use session/local storage or login cookies. Browser
  password managers may independently offer to save credentials.
- Basic authorization is base64 encoding, not encryption; use HTTPS.
  Never put credentials in URLs, logs, API access-log templates, or shared
  screenshots. The private layout has no analytics, suppresses referrers,
  and is excluded from indexing. The Lambda credential check, not the page
  URL or CORS, protects uploads.
- Signing out clears local credentials but does not revoke already issued
  S3 URLs or grants. Requests still require credentials to use a grant.
- This page does not publish posts, delete completed media, or alter the
  existing blog workflow. Uploads after deployment do not need a build.

## Optional SAM deployment

The console steps above do not require SAM. `template.yaml` remains available
for automated deployment:

```sh
sam validate --lint --template-file infrastructure/media/template.yaml
sam build --template-file infrastructure/media/template.yaml
sam deploy --guided
```

Set `BucketsJson` to the same allowlist JSON, `BucketArns` to the explicit
bucket ARNs, `MediaObjectArns` to each bucket's permitted object-prefix ARN,
`ListPrefixes` to the permitted listing patterns (e.g. `media/*,uploads/*`),
and `SiteOrigins` to all frontend origins. Keep the ARN/prefix lists aligned
with the JSON. The template's listing policy uses the union of these prefixes;
Lambda still enforces each bucket's individual prefix. The manual policy above
can restrict listing per bucket more precisely.

The template creates only the API and Lambda role/function, not buckets or
CloudFront distributions. Credentials are still added directly in the Lambda
console; recheck/reapply them after CloudFormation updates. If updating an
older stack, review its change set for removed resources and changed permissions.

## Development checks

These are automated checks for contributors, not a requirement to run
Lambda locally before using the deployed app:

```sh
npm install
npm install --prefix infrastructure/media
node --test tests/media-api.test.mjs tests/media-client.test.mjs
npm run build
```

Tests use fixture credentials and mocked S3 calls, and exercise real AWS SDK
presigning without accessing your account. Production login, bucket CORS,
bucket/KMS policy, and URL mapping still require the live checks above.

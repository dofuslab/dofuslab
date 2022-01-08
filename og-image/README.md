<a href="https://vercel.com/new/project?template=zeit/og-image"><img width="128" src="https://vercel.com/button" align="right"></a>

# [Open Graph Image as a Service](https://og-image.now.sh)

<a href="https://twitter.com/zeithq/status/1092587111985881088">
    <img align="right" src="https://raw.githubusercontent.com/zeit/og-image/master/public/tweet.png" height="300" />
</a>

Serverless service that generates dynamic Open Graph images that you can embed in your `<meta>` tags.

For each keystroke, headless chromium is used to render an HTML page and take a screenshot of the result which gets cached.

See the image embedded in the tweet for a real use case.

## What is an Open Graph Image?

Have you ever posted a hyperlink to Twitter, Facebook, or Slack and seen an image popup?
How did your social network know how to "unfurl" the URL and get an image?
The answer is in your `<head>`.

The [Open Graph protocol](http://ogp.me) says you can put a `<meta>` tag in the `<head>` of a webpage to define this image.

It looks like the following:

```html
<head>
  <title>Title</title>
  <meta property="og:image" content="http://example.com/logo.jpg" />
</head>
```

## Why use this service?

Read the [blog post](https://vercel.com/blog/social-og-image-cards-as-a-service) for more info on the "Why" part.

The short answer is that it would take a long time to painstakingly design an image for every single blog post. And we don't want the exact same image for every blog post because that wouldn't make the article stand out when it was shared to Twitter.

That's where `og-image.now.sh` comes in. We can simply pass the title of our blog post to our generator service and it will generate the image for us on the fly!

It looks like the following:

```html
<head>
  <title>Hello World</title>
  <meta
    property="og:image"
    content="https://og-image.now.sh/Hello%20World.png"
  />
</head>
```

Now try changing the text `Hello%20World` to the title of your choosing and watch the magic happen ✨

## Deploy your own

You'll want to fork this repository and deploy your own image generator.

1. Click the fork button at the top right of GitHub
2. Clone the repo to your local machine with `git clone URL_OF_FORKED_REPO_HERE`
3. Change directory with `cd og-image`
4. Make changes by swapping out images, changing colors, etc (see [contributing](https://github.com/zeit/og-image/blob/master/CONTRIBUTING.md) for more info)
5. Run locally with `now dev` and visit [localhost:3000](http://localhost:3000) (if nothing happens, run `npm install -g now`)
6. Deploy to the cloud by running `now` and you'll get a unique URL
7. Setup [GitHub](https://vercel.com/github) to autodeploy on push

Alternatively, you can do a one-click to deploy with the button below.

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/project?template=zeit/og-image)

If you are using the Hobby plan, you will need to remove all configuration inside `now.json` besides
`rewrites`. Your `now.json` should look like this:

```json
{
  "rewrites": [{ "source": "/(.+)", "destination": "/api" }]
}
```

Once you have an image generator that sparks joy, you can setup [automatic GitHub](https://vercel.com/github) deployments so that pushing to master will deploy to production! 🚀

## Authors

- Steven ([@styfle](https://twitter.com/styfle)) - [Vercel](https://vercel.com)
- Evil Rabbit ([@evilrabbit](https://twitter.com/evilrabbit_)) - [Vercel](https://vercel.com)

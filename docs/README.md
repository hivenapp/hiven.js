# VuePress Tailwind Starter Theme

![VuePress Tailwind Starter Theme]()

This boilerplate repository is designed to serve as a starting point for creating custom websites with VuePress. Because it replaces the original theme entirely, a lot of out-of-the-box functionality you get with the default VuePress installation is not available.

You can preview the [live demo](https://vuepress-tailwind-starter.netlify.com/) for this [Github Repo](https://github.com/m2de/vuepress-tailwind-starter) hosted on [Netlify](https://www.netlify.com/).

PurgeCSS is used during the build process to keep the CSS bundle size as small as possible.

## Why VuePress

The reason for using VuePress over other platforms like [Nuxt](https://nuxtjs.org) or [Jigsaw](https://jigsaw.tighten.co/) is because VuePress offers a way to keep your content primarily in Markdown whilst providing a super lightweight tooling setup. It provides server side rendering (SSR) for search engine optimisation (SEO) and can easily be used with services like Netlify to automate the build and deployment process. Finally, you get the full power of [Vue.js](https://vuejs.org) to build out any advanced functionality, even inside Markdown files.

## How to use this starter theme

Clone the repository

```sh
git clone git@github.com:m2de/vuepress-tailwind-starter.git my-project
```

Re-initialise the git repository

```sh
cd my-project && rm -Rf .git && git init
```

## Building for development

Run the project and access the site via `http://localhost:8080`

```sh
npm run dev
```

## Building for production

```sh
npm run build
```

## Roadmap

* [x] Fix dev build to run without Purge Css
* [x] Import Tailwind and Purge CSS through VuePress Plugins
* [ ] Compile into regular installable VuePress theme. Challenge will be the Tailwind config (also waiting for 1.0)
* [ ] Add more out of the box functionality like Nav and Search

## Support

Any contributions to this package are welcome. Look me up on Twitter [@m2de_io](https://twitter.com/m2de_io), I'd love to hear from anyone with feedback and see what you have created using VuePress and Tailwind.

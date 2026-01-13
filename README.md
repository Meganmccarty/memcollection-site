# MEMCollection Site

This is the website for my personal entomology collection. It started as a way for me to view any specimen in my collection, along with its associated data, but its scope has expanded to include a variety of other features, like:
* A label generator, negating the need for Excel spreadsheets or specialized specimen database software (like [Specify EZDB](https://www.specifysoftware.org/))
* Specimen maps, displaying where each specimen was collected (powered by the wonderful [Leaflet.js library](https://leafletjs.com/))
* Species pages, for sharing my collection of live insect photos
* Trip pages, for documenting my collecting adventures

I chose to build this site using [Eleventy](https://www.11ty.dev/), a static site generator (SSG). While it may not be the best choice for a website powered by an API, I got tired of working with client-side JavaScript libraries/frameworks. And while many JS frameworks are now shifting to server-side rendering (e.g., Next.js), I just wanted something simple. Something fast. And Eleventy fit that perfectly for me.

The backend is powered by my custom API, which uses headless [Wagtail](https://wagtail.org/). You can view the [API repo here](https://github.com/Meganmccarty/memcollection-api).

## Getting Started
Given that this site relies on my custom API, this repo will probably be of limited use to everyone except me. However, if you are interested in playing around with the code, just click the "Clone" button to copy the project onto your machine.

You'll need to have [Node.js](https://nodejs.org/en) installed on your local machine in order to run the project. Using the latest version is probably best, though I am currently using Node v22.17.1 and npm version 10.9.2.

Once you have a copy of the repo, just run `npm install` followed by `npm run start` to get a server up and running. The site should be available under `http://localhost:8080/`. Eleventy will automatically watch for any file changes and update the browser accordingly (though it may take a moment for Eleventy to rebuild the HTML files).

### Connecting to the Custom API
Note that, because this project relies on my custom API, you may want to also clone it and spin up the necessary Docker containers on your machine (otherwise, you'll have a very empty Eleventy project!). You can [read the docs on how to get started with my API](https://docs.memcollection.com/getting-started.html).

If you do end up using my custom API (and populate it with sample data, whether your own or from the fixtures present in the backend repo), you'll then need to create a `.env.development` file in the project's root directory and add the following variable:

```
API_BASE_URL=http://localhost:8000/api/v2
```

This will enable Eleventy to fetch data from the API. It'll cache the data in a `.cache/` folder, so once you have the data, you don't need to keep the backend Docker containers running (unless you make changes to the data stored in the database that you'd like to see on frontend, in which case, you'd delete the cache files from Eleventy and rebuild the site).

## Developing
The `package.json` file has a variety of different commands to make developing easier. I chose to use TypeScript and Sass, so there are commands that are used directly within the `npm run start` and `npm run build` commands to ensure everything is correctly transpiled. Running `npm run lint` will lint the HTML, SCSS, and TypeScript using pally-ci, stylelint, and eslint, respectively. I've also set up unit and integration testing with Jest and Cypress, and you can run the test suites with `npm run test`. All of these tools should be ready to use as-is (no additional configuration is required).

## A Note About the Icons
Most of the icons used on the site were taken directly from (or slightly modified from) [UXWing](https://uxwing.com/). All of their icons that I used are located within the `/src/public/uxwing` directory. While their [license](https://uxwing.com/license/) doesn't require attribution, I feel it's important to give credit where credit is due. :)
# prismic-kit

> Helpful tools for building Prismic apps in React

[![Travis](https://img.shields.io/travis/ueno-llc/prismic-kit.svg?maxAge=2592000)](https://travis-ci.org/ueno-llc/prismic-kit) [![npm](https://img.shields.io/npm/v/@ueno/prismic-kit.svg?maxAge=2592000)](https://www.npmjs.com/package/@ueno/prismic-kit)

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Configuration](#configuration)
  - [Fetching on the client](#fetching-on-the-client)
  - [Rendering slice zones](#rendering-slice-zones)
  - [Enabling previews and webhooks](#enabling-previews-and-webhooks)
  - [Fetching previews on the client](#fetching-previews-on-the-client)
- [Local Development](#local-development)
- [License](#license)

## Installation

```bash
npm install @ueno/prismic-kit
```

This library has the following peer dependencies:

```json
{
  "peerDependencies": {
    "express": "5.x",
    "prismic-javascript": "1.x",
    "prop-types": "^15.6.0",
    "react": "^16.4.0"
  }
}
```

You also need `babel-polyfill`, because the code has transpiled async functions.

## Usage

### Configuration

To use the querying function `query` or Express middleware `middleware`, you'll need to configure prismic-kit with your Prismic repo name, link resolver, and access token. The access token is optional, but you need it in order to fetch Prismic previews.

```js
import PrismicKit from '@ueno/prismic-kit';
import linkResolver from './utils/prismic-link-resolver';

PrismicKit.config({
  repoName: 'ueno-llc',
  accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  linkResolver,
});
```

You can also get the config you set by calling `PrismicKit.config()` with no arguments.

### Fetching on the client

*Make sure to [configure prismic-kit](#configuration) before using this.*

The `query` function is designed to make calls to the Prismic API faster. It generates the API wrapper from `Prismic.getAPI()` for you, and on the client, the wrapper is cached, which cuts down on network requests.

This is designed for use with [react-jobs](https://www.npmjs.com/package/react-jobs), but you can also use it standalone.

```js
import React, { Component } from 'react';
import { withJob } from 'react-jobs';
import queryPrismic from '@ueno/prismic-kit/query';

@withJob({
  work: queryPrismic(api => api.getSingle('home_page')),
})
export default class App extends Component {
  render() {
    const page = this.props.jobResult;

    return (
      <h1>{page.data.title}</h1>
    );
  }
}
```

In the callback, you get access to a Prismic API wrapper, as well as the props of the component.

```js
@withJob({
  work: queryPrismic((api, props) => api.getByUID('article', props.uid)),
})
```

You can also use the function standalone if need be. Basically, you just call it twice.

```js
import { observable } from 'mobx';
import Prismic from 'prismic';
import queryPrismic from '@ueno/prismic-kit/query';

export default class PrismicStore {
  @observable articles = []

  fetchArticles = queryPrismic(api => api.query([
    Prismic.Predicates.at('document.type', 'article'),
  ]))

  constructor() {
    this.fetchArticles().then(articles => {
      this.articles.replace(articles);
    });
  }
}
```

### Rendering slice zones

Slice zones are a great feature of Prismic for building modular content, and React's component model is a perfect fit for slices. The `<SliceRenderer />` component converts a slice zone into a series of components.

To start, create one component for each slice type. This component will receive all the properties of a slice as props:

- `primary` (Object): the non-repeatable fields of a slice. Each property will be a field.
- `items` (Array of Objects): the repeatable fields of a slice. Each item will be an object with the repeatable fields.
- `slice_type` (String): the kind of slice. You usually won't need to reference this.
- `index` (Number): the index of the slice within the list.

```js
// slices/text.js
import React from 'react';
import { RichText } from 'prismic-reactjs';

const Text = ({ primary }) => (
  <div>
    {RichText.render(primary.text)}
  </div>
);
```

Now, use `<SliceRenderer />` where you want to render the slice zone, and pass in the components and slices. You can also add the `passProps` prop, which will add extra props to every slice. Use this when you need every slice to have some extra metadata.

```js
import React, { Component } from 'react';
import SliceRenderer from '@ueno/prismic-kit/slice-renderer';
import TitleSlice from './slices/title';
import Text from './slices/text';
import ImageSlice from './slices/image';

export default ({ page }) => (
  <div>
    <h1>{page.data.title}</h1>
    <div>
      <SliceRenderer
        slices={page.data.body}
        components={{
          title: TitleSlice,
          body: BodySlice,
          image: ImageSlice,
        }}
      />
    </div>
  </div>
);
```

### Enabling previews and webhooks

*Make sure to [configure prismic-kit](#configuration) before using this.*

To enable preview and webhook support, use this Express middleware.

```js
// server.js
import express from 'express';
import prismicMiddleware from '@ueno/prismic-kit/middleware';
import cache from './redis-cache';
import linkResolver from './prismic-link-resolver';

const app = express();

app.use('/api/prismic', prismicMiddleware({
  webhookCallback: () => {
    return cache.clear();
  },
  webhookSecret: process.env.PRISMIC_WEBHOOK_SECRET,
}));
```

#### Webhooks

The route `POST /webhook` is used for triggering webhooks.

If you specify a `webhookCallback` in the middleware, triggering the webhook will run the given function. The function can be synchronous, or asynchronous/Promise-returning.

If you specify a `webhookSecret`, the webhook will only trigger if the given secret is sent in the body of the request. You can configure this secret in the "Webhooks" section of your Prismic repo's settings.

This route can return any of these status codes:
  - `200 OK` if the webhook callback finished.
  - `500 Internal Server Error` if the webhook threw an error or a Promise rejected.
  - `400 Bad Request` if a secret was sent in the request, but you didn't configure a `webhookSecret`.
  - `401 Unauthorized` if the secret sent in the request doesn't match `webhookSecret`, or if no secret was sent.

#### Previews

The route `GET /preview` is used for Prismic previews. A Prismic preview cookie is sent with the response, and the `302 Found` status is used to redirect the user to the correct page.

### Fetching previews on the client

If you use server-side rendering in your React app, ordinarily you can't fetch Prismic previews on the server, because the server can't see the preview cookie.

With this in mind, we render Prismic previews like so:

- Do the initial render on the server.
- On the client, check if the Prismic preview cookie was set.
- If it is, unmount the app and then immediately remount it, forcing all the network requests to happen again, thus loading the preview version.

Like the [querying function](#fetching-on-the-client), this process is build around react-jobs, because re-mounting a component will make all of its network requests happen again.

To help with this, you can wrap your entire app in the `<PrismicPreviewLoader />` component. It will re-mount all of its children if a Prismic preview cookie is found.

```js
import React, { Component } from 'react';
import PrismicPreviewLoader from '@ueno/prismic-kit/preview-loader';

export default class App extends Component {
  render() {
    return (
      <PrismicPreviewLoader>
        {/* ... */}
      </PrismicPreviewLoader>
    );
  }
}
```

## Local Development

```bash
git clone https://github.com/ueno-llc/prismic-kit
cd prismic-kit
npm install
npm test
```

## License

MIT &copy; [ueno.](https://ueno.co)

# overwatch-scraper
![.github/workflows/run.yml](https://github.com/bottleneckco/overwatch-scraper/workflows/.github/workflows/run.yml/badge.svg)

Scripts to scrape news and patch notes for the Overwatch video game.

### Development
1. Run `yarn install`
3. Run `yarn dev:scrape` to start the scraper. In non-production environments, this will launch Chromium.
  Adjust `scraper.ts` accordingly for testing purposes (e.g. disable other sources in order to save time)

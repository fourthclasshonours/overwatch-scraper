import 'ts-polyfill/lib/es2019-array';

import puppeteer, { Browser } from 'puppeteer';

import * as Sentry from '@sentry/node';
import { readStore, writeStore } from './output';

import fs from 'fs';
import { News } from './sources/news/model';
import news from './sources/news';
import patchNotes from './sources/patch-notes';
import { PatchNotes } from './sources/patch-notes/model';

const { NODE_ENV, SENTRY_DSN } = process.env;

const isProduction = NODE_ENV === 'production';

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
  });
}

try {
  fs.mkdirSync('traces');
} catch (e) {}

async function newsScrape(browser: Browser) {
  async function tempFunc(
    chainName: string,
    workFunc: (browser: Browser) => Promise<News[]>
  ) {
    try {
      const data = await workFunc(browser);

      const store = readStore('news.json');
      writeStore('news.json', {
        ...store,
        [chainName]: data,
      });
    } catch (e) {
      console.error(e);
      Sentry?.captureException(e);
    }
  }

  await Promise.all([tempFunc('news', news)]);
}

async function patchNotesScrape(browser: Browser) {
  async function tempFunc(
    chainName: string,
    workFunc: (browser: Browser) => Promise<PatchNotes[]>
  ) {
    try {
      const data = await workFunc(browser);

      const store = readStore('patch-notes.json');
      writeStore('patch-notes.json', {
        ...store,
        [chainName]: data,
      });
    } catch (e) {
      console.error(e);
      Sentry?.captureException(e);
    }
  }

  await Promise.all([tempFunc('patch-notes', patchNotes)]);
}

async function scraper() {
  const isARMMac = process.arch === 'arm64' && process.platform === 'darwin';

  const browser = await puppeteer.launch({
    headless: isProduction,
    defaultViewport: null,
    args: isProduction ? ['--no-sandbox'] : [],
    executablePath: isARMMac
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : undefined,
  });

  await newsScrape(browser);
  await patchNotesScrape(browser);

  await browser.close();
}

scraper()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    Sentry?.captureException(e);
    process.exit(1);
  });

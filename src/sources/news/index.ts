import { Browser } from 'puppeteer';
import { News } from './model';

export default async function news(browser: Browser): Promise<News[]> {
  const page = await browser.newPage();

  await page.goto('https://playoverwatch.com/en-gb/news/');

  const featuredNews: News[] = await page.evaluate(() => {
    const elements = [
      ...document.querySelectorAll('.NewsHeader-featured .CardLink'),
    ];

    return elements.map((elem) => ({
      title: elem.querySelector('.Card-title')?.textContent ?? null,
      link: (elem as HTMLAnchorElement).href ?? null,
      image:
        window
          .getComputedStyle(elem.querySelector('.Card-thumbnail'))
          .getPropertyValue('background-image')
          ?.slice(4, -1)
          .replace(/"/g, '') ?? null,
      date: elem.querySelector('.Card-date')?.textContent ?? null,
    }));
  });

  const otherNews: News[] = await page.evaluate(() => {
    const elements = [...document.querySelectorAll('.NewsList-list .NewsItem')];

    return elements.map((elem) => ({
      title: elem.querySelector('.NewsItem-title')?.textContent ?? null,
      link: (elem.querySelector('.CardLink') as HTMLAnchorElement).href ?? null,
      image:
        window
          .getComputedStyle(elem.querySelector('.Card-thumbnail'))
          .getPropertyValue('background-image')
          ?.slice(4, -1)
          .replace(/"/g, '') ?? null,
      date: elem.querySelector('.NewsItem-subtitle')?.textContent ?? null,
    }));
  });

  return [...featuredNews, ...otherNews];
}

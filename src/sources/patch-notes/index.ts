import { Browser } from 'puppeteer';
import { PatchNotes, Section, GeneralUpdate, HeroUpdate } from './model';
import TurndownService from 'turndown';

export default async function patchNotes(
  browser: Browser
): Promise<PatchNotes[]> {
  const page = await browser.newPage();
  const turndownService = new TurndownService();

  await page.goto('https://playoverwatch.com/en-gb/news/patch-notes/');

  const results: PatchNotes[] = await page.evaluate(() => {
    const patches = [...document.querySelectorAll('.PatchNotes-patch')];

    const data: PatchNotes[] = [];

    for (const patch of patches) {
      const title = patch.querySelector('.PatchNotes-patchTitle')?.textContent;
      const date = patch.querySelector('.PatchNotes-date')?.textContent;

      const sections: Section[] = [];

      const sectionElems = [...patch.querySelectorAll('.PatchNotes-section')];

      for (const section of sectionElems) {
        const title =
          section.querySelector('.PatchNotes-sectionDescription')
            ?.textContent ?? null;
        const description =
          section.querySelector('.PatchNotes-sectionTitle')?.textContent ??
          null;

        const general_updates: GeneralUpdate[] = [];

        const generalUpdateElems = [
          ...section.querySelectorAll('.PatchNotesGeneralUpdate'),
        ];

        for (const generalUpdateElem of generalUpdateElems) {
          const title =
            generalUpdateElem.querySelector('.PatchNotesGeneralUpdate-title')
              ?.textContent ?? null;

          const description =
            generalUpdateElem.querySelector(
              '.PatchNotesGeneralUpdate-description'
            )?.innerHTML ?? null;

          general_updates.push({
            title,
            description,
          });
        }

        const hero_updates: HeroUpdate[] = [];

        const heroUpdateElems = [
          ...section.querySelectorAll('.PatchNotesHeroUpdate'),
        ];

        for (const heroUpdateElem of heroUpdateElems) {
          const icon =
            heroUpdateElem
              .querySelector('.PatchNotesHeroUpdate-icon')
              ?.getAttribute('src') ?? null;

          const name =
            heroUpdateElem.querySelector('.PatchNotesHeroUpdate-name')
              ?.textContent ?? null;

          const body =
            heroUpdateElem.querySelector('.PatchNotesHeroUpdate-body')
              ?.innerHTML ?? null;

          hero_updates.push({
            icon,
            name,
            body,
          });
        }

        sections.push({
          title,
          description,
          general_updates,
          hero_updates,
        });
      }

      data.push({
        title,
        date,
        sections,
      });
    }

    return data;
  });

  return results.map((result) => ({
    ...result,
    sections: result.sections.map((section) => ({
      ...section,
      general_updates: section.general_updates.map((update) => ({
        ...update,
        description: turndownService.turndown(update.description),
      })),
      hero_updates: section.hero_updates.map((update) => ({
        ...update,
        body: turndownService.turndown(update.body),
      })),
    })),
  }));
}

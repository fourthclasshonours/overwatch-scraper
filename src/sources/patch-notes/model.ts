export interface GeneralUpdate {
  title: string | null;
  description: string;
}

export interface HeroUpdate {
  icon: string | null;
  name: string | null;
  body: string | null;
}

export interface Section {
  title: string;
  description: string | null;
  general_updates: GeneralUpdate[];
  hero_updates: HeroUpdate[];
}

export interface PatchNotes {
  title: string;
  date: string;
  sections: Section[];
}

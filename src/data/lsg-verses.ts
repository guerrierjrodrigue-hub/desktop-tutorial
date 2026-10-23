import versesJson from "@/data/lsg-verses.json";

/**
 * The canonical Louis Segond 1910 text for the running plans' weekly verses,
 * taken from the app's Bible source (bible.helloao.org, translation `fra_lsg`)
 * and the World English Bible (`ENGWEBP`) for English. This is the single source
 * of truth: the plan content and the run-verse guard test both compare against
 * it, so the verses shown in a plan always match the app's Bible, with accents.
 */
export interface LsgVerse {
  key: string;
  ref: string;
  refEn: string;
  text: string;
  textEn: string;
}

export const LSG_VERSES: LsgVerse[] = versesJson as LsgVerse[];

export function lsgByKey(key: string): LsgVerse | undefined {
  return LSG_VERSES.find((v) => v.key === key);
}

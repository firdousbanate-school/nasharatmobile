import type { PublicSchoolProfileRow } from "./getPublicSchoolProfile";
import { resolveLocalizedText } from "./resolveLocalizedText";

export type AboutCardItem = {
  key: string;
  iconType: "vision" | "mission" | "leadership" | "objectives";
  title: string;
  content: string;
};

export function buildAboutCardList(
  school: PublicSchoolProfileRow | null,
  locale: string,
  t: (key: string) => string,
  tSettings: (key: string) => string,
): AboutCardItem[] {
  if (!school) return [];

  const items: AboutCardItem[] = [];

  const vision = resolveLocalizedText(locale, school.vision_ar, school.vision_en, school.vision);
  if (vision) {
    items.push({
      key: "vision",
      iconType: "vision",
      title: t("vision"),
      content: vision,
    });
  }

  const mission = resolveLocalizedText(
    locale,
    school.mission_ar,
    school.mission_en,
    school.mission,
  );
  if (mission) {
    items.push({
      key: "mission",
      iconType: "mission",
      title: t("mission"),
      content: mission,
    });
  }

  const leadershipEntries: Array<[string, string | null | undefined, string | null | undefined]> = [
    ["managerTitle", school.manager_name_ar, school.manager_name_en],
    ["assistantManager1Title", school.assistant_manager_ar, school.assistant_manager_en],
    ["assistantManager2Title", school.assistant_manager_2_ar, school.assistant_manager_2_en],
    ["assistantManager3Title", school.assistant_manager_3_ar, school.assistant_manager_3_en],
  ];
  const leadershipLines = leadershipEntries.flatMap(([key, ar, en]) => {
    const name = resolveLocalizedText(locale, ar, en);
    return name ? [`${t(key)}: ${name}`] : [];
  });

  if (leadershipLines.length > 0) {
    items.push({
      key: "leadership",
      iconType: "leadership",
      title: tSettings("leadership"),
      content: leadershipLines.join("\n"),
    });
  }

  if (school.objectives) {
    items.push({
      key: "objectives",
      iconType: "objectives",
      title: t("achievements"),
      content: school.objectives,
    });
  }

  return items;
}

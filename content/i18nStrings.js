/**
 * content/i18nStrings.js — the classic content tree's tiny localization table:
 * the SponsorBlock category display names, in every shipped UI language, for the
 * timeline-marker hover tooltip (the only localized string in the content tree —
 * timelineGeometry.formatLength is numeric M:SS, language-neutral).
 *
 * Content scripts are classic (no ES imports) and cannot pull shared/i18n.js, so
 * this is a DELIBERATE duplicate of the cat_* messages in shared/messages/<lang>.js
 * — keep the two byte-consistent, exactly like NS.DEFAULTS / NS.CATEGORY_COLORS.
 * tests/i18n.test.mjs asserts NS.CAT_NAMES[lang][id] === shared/messages[lang]["cat_"+id].
 *
 * Loaded after content/settingsClient.js (so NS.settings exists) and before the
 * modules that use it. catName() reads the language at CALL time, so a live
 * language switch takes effect on the next tooltip hover with no extra wiring.
 */

;(() => {
  const NS = self.__SBSKIP__;

  NS.CAT_NAMES = {
    en: {
      sponsor: "Sponsor",
      selfpromo: "Self-promotion",
      interaction: "Reminders (like / subscribe)",
      intro: "Intro / intermission",
      outro: "Outro / endcards",
      preview: "Preview / recap",
      filler: "Filler / tangent",
      music_offtopic: "Non-music section"
    },
    uk: {
      sponsor: "Спонсор",
      selfpromo: "Самореклама",
      interaction: "Нагадування (лайк / підписка)",
      intro: "Заставка / вступ",
      outro: "Кінцівка / кінцеві заставки",
      preview: "Прев'ю / короткий огляд",
      filler: "Вода / відступ від теми",
      music_offtopic: "Немузичний фрагмент"
    },
    ru: {
      sponsor: "Спонсор",
      selfpromo: "Самореклама",
      interaction: "Напоминания (лайк / подписка)",
      intro: "Заставка / вступление",
      outro: "Концовка / конечные заставки",
      preview: "Превью / краткий обзор",
      filler: "Вода / отступление",
      music_offtopic: "Немузыкальный фрагмент"
    }
  };

  NS.i18n = {
    /**
     * Localized display name for a category id, by the current UI language.
     * Reads NS.settings at call time (falls back to NS.DEFAULTS -> "en"), so a
     * live language change applies on the next hover. Falls back en, then raw id.
     * @param {string} cat - a SponsorBlock category id.
     * @returns {string} localized display name, or the raw category id.
     * @sideEffects None.
     */
    catName(cat) {
      // Fail-open, like the rest of the content tree: tolerate NS.settings not
      // being ready yet (never throw inside the tooltip path) — default to en.
      const s = NS.settings && typeof NS.settings.get === "function" ? NS.settings.get() : null;
      const lang = (s && s.language) || "en";
      const table = NS.CAT_NAMES[lang] || NS.CAT_NAMES.en;
      return table[cat] || cat;
    }
  };
})();

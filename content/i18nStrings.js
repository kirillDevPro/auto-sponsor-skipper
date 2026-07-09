/**
 * content/i18nStrings.js — the classic content tree's tiny localization tables:
 * the SponsorBlock category display names (for the timeline-marker hover tooltip)
 * and the skip-notice strings (for content/skipNotice.js), in every shipped UI
 * language. timelineGeometry.formatLength is numeric M:SS, language-neutral.
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

  // Skip-notice strings for the content overlay (content/skipNotice.js). Deliberate
  // duplicate of the notice_* keys in shared/messages/<lang>.js (the classic tree
  // can't import the module) — keep byte-consistent, like NS.CAT_NAMES.
  // tests/i18n.test.mjs asserts NS.NOTICE_STRINGS[lang][k] === shared/messages[lang]["notice_"+k].
  NS.NOTICE_STRINGS = {
    en: { skipped: "Skipped", undo: "Undo", close: "Dismiss" },
    uk: { skipped: "Пропущено", undo: "Скасувати", close: "Закрити" },
    ru: { skipped: "Пропущено", undo: "Отменить", close: "Закрыть" }
  };

  /**
   * The current UI language from NS.settings at call time, fail-open to "en".
   * Tolerates NS.settings not being ready yet (never throws in the content path).
   * @returns {string} the selected language code, or "en".
   * @sideEffects None.
   */
  function currentLang() {
    const s = NS.settings && typeof NS.settings.get === "function" ? NS.settings.get() : null;
    return (s && s.language) || "en";
  }

  NS.i18n = {
    /**
     * Localized display name for a category id, by the current UI language.
     * Reads NS.settings at call time (falls back to "en"), so a live language
     * change applies on the next use. Falls back en, then the raw id.
     * @param {string} cat - a SponsorBlock category id.
     * @returns {string} localized display name, or the raw category id.
     * @sideEffects None.
     */
    catName(cat) {
      const table = NS.CAT_NAMES[currentLang()] || NS.CAT_NAMES.en;
      return table[cat] || cat;
    },

    /**
     * A localized skip-notice string, by the current UI language, fail-open to "en".
     * Mirrors catName's parametrized shape so a new notice string needs no new method.
     * @param {"skipped"|"undo"|"close"} key
     * @returns {string} the localized string.
     * @sideEffects None.
     */
    notice(key) {
      const table = NS.NOTICE_STRINGS[currentLang()] || NS.NOTICE_STRINGS.en;
      return table[key];
    }
  };
})();

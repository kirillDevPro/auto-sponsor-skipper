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
 * The 27-language tables are derived from shared/messages/* by a throwaway
 * script, never hand-transcribed.
 *
 * Loaded after content/settingsClient.js (so NS.settings exists) and before the
 * modules that use it. catName() reads the language at CALL time, so a live
 * language switch takes effect on the next tooltip hover with no extra wiring.
 */

;(() => {
  const NS = self.__SBSKIP__;

  NS.CAT_NAMES = {
    ar: {
      sponsor: "رعاية",
      selfpromo: "ترويج ذاتي",
      interaction: "تذكير (إعجاب / اشتراك)",
      intro: "مقدمة / فاصل",
      outro: "خاتمة / بطاقات النهاية",
      preview: "معاينة / ملخص",
      filler: "حشو / استطراد",
      music_offtopic: "قسم غير موسيقي",
      hook: "تشويق / ترحيب"
    },
    bg: {
      sponsor: "Спонсор",
      selfpromo: "Самореклама",
      interaction: "Напомняния (харесване / абонамент)",
      intro: "Интро / пауза",
      outro: "Аутро / финални карти",
      preview: "Анонс / резюме",
      filler: "Пълнеж / отклонение",
      music_offtopic: "Немузикална част",
      hook: "Тийзър / поздрав"
    },
    cs: {
      sponsor: "Sponzor",
      selfpromo: "Vlastní propagace",
      interaction: "Připomínky (like / odběr)",
      intro: "Intro / mezihra",
      outro: "Outro / koncové karty",
      preview: "Ukázka / rekapitulace",
      filler: "Výplň / odbočka",
      music_offtopic: "Nehudební část",
      hook: "Upoutávka / pozdrav"
    },
    da: {
      sponsor: "Sponsor",
      selfpromo: "Selvpromovering",
      interaction: "Påmindelser (like / abonner)",
      intro: "Intro / pause",
      outro: "Outro / slutkort",
      preview: "Forhåndsvisning / opsummering",
      filler: "Fyld / sidespring",
      music_offtopic: "Ikke-musikafsnit",
      hook: "Hook / velkomst"
    },
    de: {
      sponsor: "Sponsor",
      selfpromo: "Eigenwerbung",
      interaction: "Erinnerungen (Liken / Abonnieren)",
      intro: "Intro / Pause",
      outro: "Outro / Endkarten",
      preview: "Vorschau / Zusammenfassung",
      filler: "Füllmaterial / Abschweifung",
      music_offtopic: "Nicht-Musik-Abschnitt",
      hook: "Teaser / Begrüßung"
    },
    el: {
      sponsor: "Χορηγία",
      selfpromo: "Αυτοπροβολή",
      interaction: "Υπενθυμίσεις (like / εγγραφή)",
      intro: "Εισαγωγή / διάλειμμα",
      outro: "Τέλος / κάρτες τέλους",
      preview: "Προεπισκόπηση / ανακεφαλαίωση",
      filler: "Παρέκβαση / γέμισμα",
      music_offtopic: "Τμήμα εκτός μουσικής",
      hook: "Δόλωμα / χαιρετισμός"
    },
    en: {
      sponsor: "Sponsor",
      selfpromo: "Self-promotion",
      interaction: "Reminders (like / subscribe)",
      intro: "Intro / intermission",
      outro: "Outro / endcards",
      preview: "Preview / recap",
      filler: "Filler / tangent",
      music_offtopic: "Non-music section",
      hook: "Hook / greeting"
    },
    es: {
      sponsor: "Patrocinador",
      selfpromo: "Autopromoción",
      interaction: "Recordatorios (me gusta / suscripción)",
      intro: "Intro / intermedio",
      outro: "Cierre / tarjetas finales",
      preview: "Avance / resumen",
      filler: "Relleno / digresión",
      music_offtopic: "Sección sin música",
      hook: "Gancho / saludo"
    },
    et: {
      sponsor: "Sponsor",
      selfpromo: "Enesereklaam",
      interaction: "Meeldetuletused (meeldib / telli)",
      intro: "Intro / vahepala",
      outro: "Lõputiitrid / lõpukaardid",
      preview: "Eelvaade / kokkuvõte",
      filler: "Täitesisu / kõrvalepõige",
      music_offtopic: "Muusikavaba osa",
      hook: "Peibutus / tervitus"
    },
    fa: {
      sponsor: "اسپانسر",
      selfpromo: "تبلیغ شخصی",
      interaction: "یادآوری (لایک / سابسکرایب)",
      intro: "مقدمه / وقفه",
      outro: "پایان / کارت‌های پایانی",
      preview: "پیش‌نمایش / خلاصه",
      filler: "پرکننده / حاشیه",
      music_offtopic: "بخش غیرموسیقی",
      hook: "تیزر / خوش‌آمدگویی"
    },
    fi: {
      sponsor: "Sponsori",
      selfpromo: "Itsemainonta",
      interaction: "Muistutukset (tykkää / tilaa)",
      intro: "Intro / tauko",
      outro: "Outro / lopetuskortit",
      preview: "Esikatselu / kertaus",
      filler: "Täyte / sivupolku",
      music_offtopic: "Ei-musiikkiosuus",
      hook: "Koukku / tervehdys"
    },
    fr: {
      sponsor: "Sponsor",
      selfpromo: "Autopromotion",
      interaction: "Rappels (j'aime / abonnement)",
      intro: "Intro / interlude",
      outro: "Outro / cartes de fin",
      preview: "Aperçu / récapitulatif",
      filler: "Remplissage / digression",
      music_offtopic: "Section non musicale",
      hook: "Accroche / salutations"
    },
    hi: {
      sponsor: "प्रायोजक",
      selfpromo: "स्वयं-प्रचार",
      interaction: "अनुस्मारक (लाइक / सब्सक्राइब)",
      intro: "इंट्रो / मध्यांतर",
      outro: "आउट्रो / एंडकार्ड",
      preview: "झलक / सारांश",
      filler: "फिलर / विषयांतर",
      music_offtopic: "गैर-संगीत भाग",
      hook: "हुक / अभिवादन"
    },
    it: {
      sponsor: "Sponsor",
      selfpromo: "Autopromozione",
      interaction: "Promemoria (mi piace / iscriviti)",
      intro: "Intro / intervallo",
      outro: "Outro / schede finali",
      preview: "Anteprima / riepilogo",
      filler: "Riempitivo / divagazione",
      music_offtopic: "Sezione non musicale",
      hook: "Hook / saluto"
    },
    ja: {
      sponsor: "スポンサー",
      selfpromo: "自己宣伝",
      interaction: "催促（高評価・登録）",
      intro: "イントロ / 幕間",
      outro: "アウトロ / エンドカード",
      preview: "プレビュー / 要約",
      filler: "余談 / 脱線",
      music_offtopic: "非音楽パート",
      hook: "冒頭のフック / 挨拶"
    },
    ko: {
      sponsor: "스폰서",
      selfpromo: "자기 홍보",
      interaction: "알림 (좋아요 / 구독)",
      intro: "인트로 / 막간",
      outro: "아웃트로 / 엔드카드",
      preview: "미리보기 / 요약",
      filler: "군더더기 / 잡담",
      music_offtopic: "음악 외 구간",
      hook: "훅 / 인사말"
    },
    lt: {
      sponsor: "Rėmėjas",
      selfpromo: "Savireklama",
      interaction: "Priminimai (patinka / prenumeruoti)",
      intro: "Įžanga / pertraukėlė",
      outro: "Pabaiga / baigiamosios kortelės",
      preview: "Anonsas / santrauka",
      filler: "Užpildas / nukrypimas",
      music_offtopic: "Ne muzikos dalis",
      hook: "Užkaba / pasisveikinimas"
    },
    no: {
      sponsor: "Sponsor",
      selfpromo: "Egenreklame",
      interaction: "Påminnelser (lik / abonner)",
      intro: "Intro / pause",
      outro: "Outro / sluttkort",
      preview: "Forhåndsvisning / oppsummering",
      filler: "Fyllstoff / digresjon",
      music_offtopic: "Del uten musikk",
      hook: "Teaser / hilsen"
    },
    pl: {
      sponsor: "Sponsor",
      selfpromo: "Autopromocja",
      interaction: "Przypomnienia (łapka / subskrypcja)",
      intro: "Intro / przerwa",
      outro: "Outro / karty końcowe",
      preview: "Zapowiedź / podsumowanie",
      filler: "Wypełniacz / dygresja",
      music_offtopic: "Sekcja niemuzyczna",
      hook: "Zajawka / powitanie"
    },
    "pt_PT": {
      sponsor: "Patrocínio",
      selfpromo: "Autopromoção",
      interaction: "Lembretes (gosto / subscrever)",
      intro: "Introdução / intervalo",
      outro: "Final / cartões finais",
      preview: "Antevisão / resumo",
      filler: "Enchimento / divagação",
      music_offtopic: "Secção sem música",
      hook: "Gancho / saudação"
    },
    ro: {
      sponsor: "Sponsor",
      selfpromo: "Autopromovare",
      interaction: "Mementouri (like / abonare)",
      intro: "Intro / pauză",
      outro: "Outro / carduri finale",
      preview: "Previzualizare / recapitulare",
      filler: "Umplutură / divagație",
      music_offtopic: "Secțiune non-muzicală",
      hook: "Teaser / salut"
    },
    ru: {
      sponsor: "Спонсор",
      selfpromo: "Самореклама",
      interaction: "Напоминания (лайк / подписка)",
      intro: "Заставка / вступление",
      outro: "Концовка / конечные заставки",
      preview: "Превью / краткий обзор",
      filler: "Вода / отступление",
      music_offtopic: "Немузыкальный фрагмент",
      hook: "Затравка / приветствие"
    },
    sk: {
      sponsor: "Sponzor",
      selfpromo: "Vlastná propagácia",
      interaction: "Výzvy (lajk / odber)",
      intro: "Intro / prestávka",
      outro: "Outro / záverečné karty",
      preview: "Ukážka / zhrnutie",
      filler: "Výplň / odbočka",
      music_offtopic: "Nehudobná časť",
      hook: "Návnada / pozdrav"
    },
    sv: {
      sponsor: "Sponsor",
      selfpromo: "Egenreklam",
      interaction: "Påminnelser (gilla / prenumerera)",
      intro: "Intro / paus",
      outro: "Outro / slutkort",
      preview: "Förhandsvisning / sammanfattning",
      filler: "Utfyllnad / sidospår",
      music_offtopic: "Icke-musikavsnitt",
      hook: "Teaser / hälsning"
    },
    tr: {
      sponsor: "Sponsor",
      selfpromo: "Kendi tanıtımı",
      interaction: "Hatırlatmalar (beğen / abone ol)",
      intro: "Giriş / ara",
      outro: "Kapanış / bitiş kartları",
      preview: "Önizleme / özet",
      filler: "Dolgu / konu dışı",
      music_offtopic: "Müzik dışı bölüm",
      hook: "Merak kancası / karşılama"
    },
    uk: {
      sponsor: "Спонсор",
      selfpromo: "Самореклама",
      interaction: "Нагадування (лайк / підписка)",
      intro: "Заставка / вступ",
      outro: "Кінцівка / кінцеві заставки",
      preview: "Прев'ю / короткий огляд",
      filler: "Вода / відступ від теми",
      music_offtopic: "Немузичний фрагмент",
      hook: "Гачок / вітання"
    },
    "zh_CN": {
      sponsor: "赞助广告",
      selfpromo: "自我推广",
      interaction: "互动提醒（点赞 / 订阅）",
      intro: "片头 / 过场",
      outro: "片尾 / 推荐卡片",
      preview: "预览 / 回顾",
      filler: "闲聊 / 离题内容",
      music_offtopic: "非音乐部分",
      hook: "开场悬念 / 问候"
    }
  };


  // Skip-notice strings for the content overlay (content/skipNotice.js). Deliberate
  // duplicate of the notice_* keys in shared/messages/<lang>.js (the classic tree
  // can't import the module) — keep byte-consistent, like NS.CAT_NAMES.
  // tests/i18n.test.mjs asserts NS.NOTICE_STRINGS[lang][k] === shared/messages[lang]["notice_"+k].
  NS.NOTICE_STRINGS = {
    ar: { skipped: "تم التخطي", undo: "تراجع", close: "إغلاق" },
    bg: { skipped: "Прескочено", undo: "Отмени", close: "Затвори" },
    cs: { skipped: "Přeskočeno", undo: "Zpět", close: "Zavřít" },
    da: { skipped: "Sprunget over", undo: "Fortryd", close: "Luk" },
    de: { skipped: "Übersprungen", undo: "Rückgängig", close: "Schließen" },
    el: { skipped: "Παραλείφθηκε", undo: "Αναίρεση", close: "Κλείσιμο" },
    en: { skipped: "Skipped", undo: "Undo", close: "Dismiss" },
    es: { skipped: "Saltado", undo: "Deshacer", close: "Cerrar" },
    et: { skipped: "Vahele jäetud", undo: "Võta tagasi", close: "Sulge" },
    fa: { skipped: "رد شد", undo: "بازگردانی", close: "بستن" },
    fi: { skipped: "Ohitettu", undo: "Kumoa", close: "Sulje" },
    fr: { skipped: "Passé", undo: "Annuler", close: "Fermer" },
    hi: { skipped: "स्किप किया", undo: "पूर्ववत करें", close: "बंद करें" },
    it: { skipped: "Saltato", undo: "Annulla", close: "Chiudi" },
    ja: { skipped: "スキップしました", undo: "元に戻す", close: "閉じる" },
    ko: { skipped: "건너뜀", undo: "실행 취소", close: "닫기" },
    lt: { skipped: "Praleista", undo: "Atšaukti", close: "Užverti" },
    no: { skipped: "Hoppet over", undo: "Angre", close: "Lukk" },
    pl: { skipped: "Pominięto", undo: "Cofnij", close: "Zamknij" },
    "pt_PT": { skipped: "Saltado", undo: "Anular", close: "Fechar" },
    ro: { skipped: "Omis", undo: "Anulează", close: "Închide" },
    ru: { skipped: "Пропущено", undo: "Отменить", close: "Закрыть" },
    sk: { skipped: "Preskočené", undo: "Späť", close: "Zavrieť" },
    sv: { skipped: "Hoppade över", undo: "Ångra", close: "Stäng" },
    tr: { skipped: "Atlandı", undo: "Geri al", close: "Kapat" },
    uk: { skipped: "Пропущено", undo: "Скасувати", close: "Закрити" },
    "zh_CN": { skipped: "已跳过", undo: "撤销", close: "关闭" }
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

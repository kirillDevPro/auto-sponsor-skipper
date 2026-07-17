/**
 * shared/messages/el.js — Greek UI strings for the in-page popup and options
 * runtime. This table mirrors the key set of en.js exactly (same keys, same
 * order); tests/i18n.test.mjs fails on drift.
 *
 * These are the IN-PAGE strings only. The manifest name/description live
 * separately in _locales/ (native chrome.i18n, browser-locale for the Chrome
 * Web Store listing). `extName` is intentionally in BOTH places: the popup <h1>
 * localizes it in-page, the manifest localizes it for chrome://extensions.
 * `extName` is a brand name — keep it byte-identical across every locale
 * (never translate it).
 */

export default {
  extName: "Auto Sponsor Skipper",

  // SponsorBlock skip categories (keys match CATEGORIES[].i18nKey).
  cat_sponsor: "Χορηγία",
  cat_selfpromo: "Αυτοπροβολή",
  cat_interaction: "Υπενθυμίσεις (like / εγγραφή)",
  cat_intro: "Εισαγωγή / διάλειμμα",
  cat_outro: "Τέλος / κάρτες τέλους",
  cat_preview: "Προεπισκόπηση / ανακεφαλαίωση",
  cat_filler: "Παρέκβαση / γέμισμα",
  cat_music_offtopic: "Τμήμα εκτός μουσικής",
  cat_hook: "Δόλωμα / χαιρετισμός",

  // Popup.
  popup_enabled: "Η παράλειψη είναι ενεργή",
  popup_categories: "Παράλειψη αυτών των τμημάτων",
  popup_skipped: "Τμήματα που παραλείφθηκαν",
  popup_time_saved: "Εξοικονομημένος χρόνος",
  popup_open_settings: "Περισσότερες ρυθμίσεις",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "Θα παραλειφθούν:",
  popup_status_off: "Η παράλειψη είναι απενεργοποιημένη",
  popup_status_whitelisted: "Το κανάλι είναι στη λίστα εξαιρέσεων",
  popup_status_none: "Δεν έχουν επισημανθεί τμήματα ακόμη",
  popup_status_too_short: "Τα ενεργά τμήματα είναι κάτω από την ελάχιστη διάρκεια",
  popup_status_category_off: "Αυτές οι κατηγορίες τμημάτων είναι απενεργοποιημένες",
  popup_status_error: "Αδυναμία φόρτωσης δεδομένων τμημάτων",
  popup_status_checking: "Έλεγχος…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — Ρυθμίσεις",
  tab_settings: "Ρυθμίσεις",
  tab_statistics: "Στατιστικά",
  settings_general: "Γενικά",
  settings_language: "Γλώσσα διεπαφής",
  settings_enabled: "Ενεργοποίηση αυτόματης παράλειψης",
  settings_timeline_markers: "Εμφάνιση δεικτών τμημάτων στη μπάρα προόδου",
  settings_skip_notice: "Εμφάνιση ειδοποίησης παράλειψης με κουμπί αναίρεσης",
  settings_categories: "Κατηγορίες προς παράλειψη",
  settings_min_length: "Ελάχιστη διάρκεια τμήματος (δευτερόλεπτα)",
  settings_min_length_hint: "Τα τμήματα με μικρότερη διάρκεια αγνοούνται. 0 = παράλειψη όλων.",
  settings_whitelist: "Λίστα εξαιρέσεων καναλιών",
  settings_whitelist_hint: "Η παράλειψη απενεργοποιείται σε αυτά τα κανάλια. Προσθέστε ένα όνομα καναλιού (π.χ. @channelname) ή ένα id τύπου channel/UC...",
  settings_whitelist_add: "Προσθήκη",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "Δεν υπάρχουν κανάλια στη λίστα εξαιρέσεων.",
  settings_remove: "Αφαίρεση",
  settings_stats: "Στατιστικά",
  settings_stats_count: "Τμήματα που παραλείφθηκαν",
  settings_stats_time: "Εξοικονομημένος χρόνος",
  settings_stats_reset: "Επαναφορά στατιστικών",
  settings_saved: "Αποθηκεύτηκε",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "Παραλείφθηκε",
  notice_undo: "Αναίρεση",
  notice_close: "Κλείσιμο",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "ώ",
  duration_minute_short: "λ",
  duration_second_short: "δ",

  // About / legal.
  attribution: "Δεδομένα τμημάτων από το SponsorBlock (sponsor.ajay.app), υπό την άδεια CC BY-NC-SA 4.0.",
  not_affiliated: "Πρόκειται για μια δωρεάν, μη εμπορική εφαρμογή-πελάτη μόνο για ανάγνωση, η οποία δεν συνδέεται με το SponsorBlock ή το YouTube / Google, δεν εγκρίνεται από αυτά και δεν δημιουργήθηκε από αυτά.",
  privacy_note: "Στο SponsorBlock αποστέλλεται μόνο ένα hash 4 χαρακτήρων του αναγνωριστικού του βίντεο, για την αναζήτηση τμημάτων. Δεν διαθέτουμε διακομιστές, ούτε αναλυτικά στοιχεία, ούτε παρακολούθηση. Οι ρυθμίσεις σας αποθηκεύονται από το Chrome και, αν έχετε ενεργοποιημένο το Chrome Sync, συγχρονίζονται σε όλα τα προγράμματα περιήγησης στα οποία έχετε συνδεθεί· τα στατιστικά και η λίστα εξαιρέσεων καναλιών παραμένουν σε αυτή τη συσκευή."
};

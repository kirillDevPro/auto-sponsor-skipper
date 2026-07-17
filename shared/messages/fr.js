/**
 * shared/messages/fr.js — French UI strings (mirrors the key set of en.js, the
 * source-of-truth locale for the in-page popup and options runtime). Every
 * message table in this folder MUST carry the identical key set;
 * tests/i18n.test.mjs fails on drift.
 *
 * These are the IN-PAGE strings only. The manifest name/description live
 * separately in _locales/ (native chrome.i18n, browser-locale for the Chrome
 * Web Store listing). `extName` is intentionally in BOTH places: the popup <h1>
 * localizes it in-page, the manifest localizes it for chrome://extensions.
 * `extName` is a brand name — keep it byte-identical across every locale (never
 * translate it).
 */

export default {
  extName: "Auto Sponsor Skipper",

  // SponsorBlock skip categories (keys match CATEGORIES[].i18nKey).
  cat_sponsor: "Sponsor",
  cat_selfpromo: "Autopromotion",
  cat_interaction: "Rappels (j'aime / abonnement)",
  cat_intro: "Intro / interlude",
  cat_outro: "Outro / cartes de fin",
  cat_preview: "Aperçu / récapitulatif",
  cat_filler: "Remplissage / digression",
  cat_music_offtopic: "Section non musicale",
  cat_hook: "Accroche / salutations",

  // Popup.
  popup_enabled: "Saut activé",
  popup_categories: "Segments à passer",
  popup_skipped: "Segments passés",
  popup_time_saved: "Temps gagné",
  popup_open_settings: "Plus d'options",

  // Current-video status line (popup, active YouTube tab).
  popup_status_will_skip: "Sera passé :",
  popup_status_off: "Le saut est désactivé",
  popup_status_whitelisted: "Cette chaîne est sur la liste blanche",
  popup_status_none: "Aucun segment signalé pour l'instant",
  popup_status_too_short: "Les segments activés sont plus courts que votre durée minimale",
  popup_status_category_off: "Ces catégories de segments sont désactivées",
  popup_status_error: "Impossible de charger les données des segments",
  popup_status_checking: "Vérification…",

  // Options page.
  settings_title: "Auto Sponsor Skipper — Paramètres",
  tab_settings: "Paramètres",
  tab_statistics: "Statistiques",
  settings_general: "Général",
  settings_language: "Langue de l'interface",
  settings_enabled: "Activer le saut automatique",
  settings_timeline_markers: "Afficher les marqueurs de segments sur la barre de progression",
  settings_skip_notice: "Afficher une notification de saut avec un bouton d'annulation",
  settings_categories: "Catégories à passer",
  settings_min_length: "Durée minimale d'un segment (secondes)",
  settings_min_length_hint: "Les segments plus courts sont ignorés. 0 = tout passer.",
  settings_whitelist: "Liste blanche de chaînes",
  settings_whitelist_hint: "Le saut est désactivé sur ces chaînes. Ajoutez le pseudo d'une chaîne (par ex. @channelname) ou son identifiant channel/UC...",
  settings_whitelist_add: "Ajouter",
  settings_whitelist_placeholder: "@channelname",
  settings_whitelist_empty: "Aucune chaîne sur la liste blanche.",
  settings_remove: "Retirer",
  settings_stats: "Statistiques",
  settings_stats_count: "Segments passés",
  settings_stats_time: "Temps gagné",
  settings_stats_reset: "Réinitialiser les statistiques",
  settings_saved: "Enregistré",

  // Skip notice (content overlay shown over the player after a skip).
  notice_skipped: "Passé",
  notice_undo: "Annuler",
  notice_close: "Fermer",

  // Compact duration unit labels (used by formatDuration for the stat tiles).
  duration_hour_short: "h",
  duration_minute_short: "min",
  duration_second_short: "s",

  // About / legal.
  attribution: "Données de segments fournies par SponsorBlock (sponsor.ajay.app), sous licence CC BY-NC-SA 4.0.",
  not_affiliated: "Il s'agit d'un client gratuit, non commercial et en lecture seule, qui n'est ni affilié à, ni approuvé par, ni créé par SponsorBlock ou YouTube / Google.",
  privacy_note: "Seul un hachage de 4 caractères de l'identifiant de la vidéo est envoyé à SponsorBlock pour rechercher les segments. Nous n'exploitons aucun serveur, aucune analyse et aucun suivi. Vos paramètres sont stockés par Chrome et, si Chrome Sync est activé, synchronisés entre vos navigateurs connectés ; les statistiques et la liste blanche de chaînes restent sur cet appareil."
};

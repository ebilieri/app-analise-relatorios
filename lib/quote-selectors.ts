/**
 * CSS selector lists for extracting quote fields from statusinvest asset pages.
 * Each field has an ordered list of selectors; the scraper tries them in sequence
 * and uses the first one that returns a non-empty value (FR-011).
 *
 * NOTE: These selectors target statusinvest.com.br page structure.
 * The :contains() pseudo-class is supported by cheerio's css-select engine.
 * If the site's HTML structure changes, update the primary selectors and
 * the text-based fallbacks will continue to work.
 */

export type SelectorList = readonly string[];

export const QUOTE_SELECTORS = {
  /**
   * Valor Atual: the current trading price of the asset.
   * On statusinvest, this is typically the first indicator card.
   */
  valorAtual: [
    // Text-based: find indicator containing "VALOR ATUAL" label
    'div.info:contains("VALOR ATUAL") strong.value',
    'div.info:contains("Valor atual") strong.value',
    // Positional: first indicator card (usually VALOR ATUAL on statusinvest)
    '#main-2 .top-info div.info:first-child strong.value',
    'div.top-info div.info:first-child strong.value',
    // Generic fallback
    '#main-2 strong.value',
  ] as SelectorList,

  /**
   * Mínimo das últimas 52 semanas.
   */
  min52Semanas: [
    // Text-based (most resilient to layout changes)
    'div.info:contains("MIN. 52") strong.value',
    'div.info:contains("MÍN. 52") strong.value',
    'div.info:contains("Min. 52") strong.value',
    // Structure-based fallbacks
    '.oscilation-range small',
    '.min-max .min strong',
    '.osc-min strong',
  ] as SelectorList,

  /**
   * Máximo das últimas 52 semanas.
   */
  max52Semanas: [
    // Text-based (most resilient to layout changes)
    'div.info:contains("MÁX. 52") strong.value',
    'div.info:contains("MAX. 52") strong.value',
    'div.info:contains("Máx. 52") strong.value',
    // Structure-based fallbacks
    '.oscilation-range strong:last-of-type',
    '.min-max .max strong',
    '.osc-max strong',
  ] as SelectorList,
} as const;

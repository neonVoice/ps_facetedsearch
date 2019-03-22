/**
 * 2007-2019 PrestaShop.
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Academic Free License 3.0 (AFL-3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/AFL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to http://www.prestashop.com for more information.
 *
 * @author    PrestaShop SA <contact@prestashop.com>
 * @copyright 2007-2019 PrestaShop SA
 * @license   https://opensource.org/licenses/AFL-3.0 Academic Free License 3.0 (AFL-3.0)
 * International Registered Trademark & Property of PrestaShop SA
 */

import NumberSymbol from '../cldr/number-symbol';
import CurrencyFormatter from '../cldr/currency-formatter';
import PriceSpecification from '../cldr/price-specification';

function prepareCurrencyFormatter(specifications) {
  const symbol = new NumberSymbol(...specifications.symbol);
  const currency = new CurrencyFormatter(
    new PriceSpecification(
      specifications.positivePattern,
      specifications.negativePattern,
      symbol,
      parseInt(specifications.maxFractionDigits, 10),
      parseInt(specifications.minFractionDigits, 10),
      specifications.groupingUsed,
      specifications.primaryGroupSize,
      specifications.secondaryGroupSize,
      specifications.currencySymbol,
      specifications.currencyCode,
    ),
  );

  return currency;
}

/**
 * Refresh facets sliders
 */
function refreshSliders() {
  $('.faceted-slider').each(function initializeSliders() {
    const $el = $(this);
    const $values = $el.data('slider-values');
    const specifications = $el.data('slider-specifications');
    let formatter;
    if (specifications.length) {
      formatter = prepareCurrencyFormatter(specifications);
    }

    $(`#slider-range_${$el.data('slider-id')}`).slider({
      range: true,
      min: $el.data('slider-min'),
      max: $el.data('slider-max'),
      values: [
        $values[0],
        $values[1],
      ],
      change(event, ui) {
        const nextEncodedFacetsURL = $el.data('slider-encoded-url');
        // because spaces are replaces with %20, and sometimes by +, we want to keep the + sign
        const nextEncodedFacets = escape($el.data('slider-encoded-facets')).replace(/%20/g, '+');
        prestashop.emit(
          'updateFacets',
          nextEncodedFacetsURL.replace(
            nextEncodedFacets,
            nextEncodedFacets.replace(
              `${$el.data('slider-min')}-${$el.data('slider-max')}`,
              `${ui.values[0]}-${ui.values[1]}`,
            ),
          ),
        );
      },
      slide(event, ui) {
        const $displayBlock = $(`#facet_label_${$el.data('slider-id')}`);

        if (specifications) {
          $displayBlock.text(
            $displayBlock.text().replace(
              /([^\d]*)(?:[\d .,]+)([^\d]+)(?:[\d .,]+)(.*)/,
              `$1${ui.values[0]}$2${ui.values[1]}$3`,
            ),
          );
        } else {
          $displayBlock.text(
            `${formatter.format(ui.values[0])} - ${formatter.format(ui.values[1])}`,
          );
        }
      },
    });
  });
}

$(document).ready(() => {
  prestashop.on('updateProductList', (data) => {
    refreshSliders(data);
  });

  refreshSliders();
});

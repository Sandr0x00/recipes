/* global $, Image */

'use strict';

/** Image lazy loading, with placeholder. */
async function loadImages() {
    $('.placeholder').each( function() {
        if (!$(this).data('large')) {
            return;
        }
        let bgImg = new Image();
        bgImg.onload = () => {
            $(this).css('background-image', 'url(' + bgImg.src + ')');
            $(this).removeClass('blur');
        };
        bgImg.src = $(this).data('large');
    });
}
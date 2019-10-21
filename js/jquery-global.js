/* global loadRecipe, dialogComp */

import jquery from 'jquery';
import $ from 'jquery';
window.jQuery = jquery;

import { icon } from '@fortawesome/fontawesome-svg-core';
import { faMoon as farMoon } from '@fortawesome/free-regular-svg-icons';
import { faMoon as fasMoon } from '@fortawesome/free-solid-svg-icons';


function isMD() {
    // let xs = window.getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-xs');
    // let sm = window.getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-sm');
    let md = window.getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-md');
    let lg = window.getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-lg');
    let xl = window.getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-xl');
    // let is_xs = window.matchMedia('(min-width: '+xs+')').matches;
    // let is_sm = window.matchMedia('(min-width: '+sm+')').matches;
    let is_md = window.matchMedia('(min-width: '+md+')').matches;
    let is_lg = window.matchMedia('(min-width: '+lg+')').matches;
    let is_xl = window.matchMedia('(min-width: '+xl+')').matches;
    if (is_xl) {
        return true;
    }
    if (is_lg) {
        return true;
    }
    if (is_md) {
        return true;
    }
    return false;
}

isMD();

function fadeOutIngredients() {
    let $ = window.jQuery;
    if ($('#ingredients').hasClass('d-none')) {
        return;
    }
    if (isMD()) {
        setTimeout(() => {
            $('#ingredients').toggleClass('col-md-4 col-md-1 grow shrink');
            $('#preparation').toggleClass('col-md-8 col-md-11 grow shrink');
        }, 100);
        setTimeout(() => {
            $('#ingredients').addClass('d-none');
            $('#ingredients-vert').removeClass('d-none');
            $('#preparation').addClass('d-none');
            $('#preparation-amounts').removeClass('d-none');
        }, 1100);
    } else {
        $('#inglist').toggleClass('h-0 h-100');
        setTimeout(() => {
            if ($('#preparation').hasClass('d-none')) {
                $('#preparation-amounts').addClass('d-none');
                $('#preparation').removeClass('d-none');
            } else {
                $('#preparation').addClass('d-none');
                $('#preparation-amounts').removeClass('d-none');
            }
        }, 100);
    }
    // setTimeout(() => {
    //     $('#preparation').addClass('d-none');
    //     $('#preparation-amounts').removeClass('d-none');
    // }, 1200);
}

function fadeInIngredients() {
    if (!$('#ingredients').hasClass('d-none')) {
        return;
    }
    $('#preparation').removeClass('d-none');
    $('#preparation-amounts').addClass('d-none');
    if (isMD()) {
        $('#ingredients-vert').addClass('d-none');
        $('#ingredients').removeClass('d-none');
        setTimeout(() => {
            $('#ingredients').toggleClass('col-md-4 col-md-1 grow shrink');
            $('#preparation').toggleClass('col-md-8 col-md-11 grow shrink');
        }, 100);
    }
}

$( document ).ready(function() {
    $('.fadeOut').on('click', fadeOutIngredients);
    $('.fadeIn').on('click', fadeInIngredients);
    $('.lnk').on('click', function(){
        loadRecipe($(this).data('link'), $(this));
        $(this).off('click');
        $(this).removeAttr('href');
    } );
    $('#moon').html(icon(farMoon).html);
    $('#moon').on('click', function() {
        if ($('body').hasClass('dark-mode')) {
            $(this).html(icon(fasMoon).html);
            $('body').removeClass('dark-mode');
            $('body').addClass('light-mode');
        } else {
            $(this).html(icon(farMoon).html);
            $('body').removeClass('light-mode');
            $('body').addClass('dark-mode');
        }
    });

    let credits = '<p>Icons made by <a href="https://flaticon.com/authors/smashicons">Smashicons</a> from <a href="https://flaticon.com">flaticon.com</a></p>\
    <p>Icons made by <a href="https://www.freepik.com/" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></p>\
    <p>Icons made by <a href="https://www.flaticon.com/authors/chanut" title="Chanut">Chanut</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></p>\
    <p>Icons made by <a href="https://www.flaticon.com/authors/smashicons" title="Smashicons">Smashicons</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></p>\
    <p>Icons made by <a href="https://www.flaticon.com/authors/kiranshastry" title="Kiranshastry">Kiranshastry</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" 			    title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></p>\
    <p>Glass Icons made by <a href="http://www.jeffportaro.com/">http://www.jeffportaro.com/</a></div></p>';
    $('#credits').click(() => {
        dialogComp.show(credits);
    });
});



/* global loadRecipe, dialogComp */

import jquery from 'jquery';
import $ from 'jquery';
window.jQuery = jquery;

import { icon } from '@fortawesome/fontawesome-svg-core';
import { faMoon as farMoon } from '@fortawesome/free-regular-svg-icons';
import { faMoon as fasMoon } from '@fortawesome/free-solid-svg-icons';

import { setCookie, dark, light } from './cookies.js';

$( document ).ready(function() {
    $('.lnk').on('click', function(){
        loadRecipe($(this).data('link'), $(this));
        $(this).off('click');
        $(this).removeAttr('href');
    } );
    $('#moon').html(icon($('body').hasClass(dark()) ? farMoon : fasMoon).html);

    $('#moon').on('click', function() {
        if ($('body').hasClass(dark())) {
            setCookie('theme', light());
            $(this).html(icon(fasMoon).html);
            $('body').removeClass(dark());
            $('body').addClass(light());
        } else {
            setCookie('theme', dark());
            $(this).html(icon(farMoon).html);
            $('body').removeClass(light());
            $('body').addClass(dark());
        }
    });
});



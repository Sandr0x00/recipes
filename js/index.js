/* global loadRecipe, dialogComp */

import jquery from 'jquery';
import $ from 'jquery';
window.jQuery = jquery;

import { icon } from '@fortawesome/fontawesome-svg-core';
import { faMoon as farMoon } from '@fortawesome/free-regular-svg-icons';
import { faCogs, faMoon as fasMoon } from '@fortawesome/free-solid-svg-icons';

import { setCookie, dark, light } from './cookies.js';

$( document ).ready(function() {
    $('.lnk').on('click', function(){
        loadRecipe($(this).data('link'), $(this));
        $(this).off('click');
        $(this).removeAttr('href');
    } );
    $('#settings').html(icon(faCogs).html);
    $('#settings').on('click', function() {
        dialogComp.showSettings();
    });
});


import './dialog.js';
import './loading.js';
import './main.js';
import './recipe.js';
import './recipes.js';
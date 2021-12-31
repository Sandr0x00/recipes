/* global loadRecipe, dialogComp */

import $ from 'jquery';

import { icon } from '@fortawesome/fontawesome-svg-core';
import { faCogs } from '@fortawesome/free-solid-svg-icons';

$(function() {
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
/* global loadingComp, dialogComp */

import { html } from 'lit';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import tagTranslator from './tags.js';
import {BaseComp} from './base.js';
import $ from 'jquery';
import { icon } from '@fortawesome/fontawesome-svg-core';
import { faExternalLinkAlt, faBars } from '@fortawesome/free-solid-svg-icons';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { formatPreparation, formatPreparationStep } from '../shared.js';
import { getCookie } from './cookies.js';

class Recipe extends BaseComp {

    static get properties() {
        return {
            recipe: { type: String },
            data: { type: Object },
            compact: Boolean,
            all: Array
        };
    }

    constructor() {
        super();
        loadingComp.open();
        this.recipe = null;
        this.data = null;
        this.compact = false;
        this.all = [];
    }

    render() {
        if (!this.data || this.all.length == 0) {
            return html``;
        }

        let preparation;
        let tags;
        let ingredients;
        // Images
        let images = html``;
        if (this.data.images) {
            if (this.data.images.length == 1) {
                images = html`${images}
<div class="recipeImage one-image">
    <div class="placeholderWrapper">
        <div class="placeholder blur" data-large='/images/${this.data.images[0]}' style="background-image: url('/images/placeholder_${this.data.images[0]}');">
        </div>
    </div>
</div>`;
            } else {
                this.data.images.forEach(img => {
                    images = html`${images}
<div class="recipeImage two-images">
    <div class="placeholderWrapper">
        <div class="placeholder blur" data-large='/images/${img}' style="background-image: url('/images/placeholder_${img}');">
        </div>
    </div>
</div>`;
                });
            }
            images = html`<div class="images">${images}</div>`;
        }

        for (let cnt = this.all.length - 1; cnt >= 0; cnt--) {
            let y_pos = this.all.length - cnt;
            let data = this.all[cnt];

            // Ingredients
            let new_ingredients = html``;
            for (const [id, ingredient] of Object.entries(data.ingredients)) {
                let i = html``;
                if (ingredient.link) {
                    i = html`<span> </span><a onclick="loadingComp.navigate('${ingredient.link}')">${unsafeHTML(icon(faExternalLinkAlt).html[0])}</a>`;
                }
                new_ingredients = html`${new_ingredients}
    <li class="${id} ingredient min-w" onmouseover="window.recipeComp.highlightOn('${id}')" onmouseout="window.recipeComp.highlightOff('${id}')">
        ${(ingredient.amount ? ingredient.amount + ' ' : '')}${unsafeHTML(ingredient.name)}
        ${i}
    </li>`;
            }

            ingredients = html`${ingredients}
<div class="ingredients" style="grid-area: ${2 + y_pos}/1;">
    <div class="h-100 o-hidden" id="inglist">
        <ul>${new_ingredients}</ul>
        ${data.portions ? html`<h4>${data.portions}</h4>` : html``}
    </div>
</div>`;

            // Tags
            tags = this.data.tags.map(tag => {
                return html`<a class="tags" onclick="loadingComp.navigate('/tags?${tag}')" id="tag_${tag}" title="${tagTranslator[tag]}"><img alt="${tagTranslator[tag]}" src="icons/${tag}.svg" /></a>`;
            });
            tags = html`<div class="recipe-tags"><h2>Tags</h2>${tags}</div>`;

            // Preparation
            let steps = html``;
            data.preparation.forEach(step => {
                step = formatPreparationStep(this.data.name, step, this.data.ingredients, this.compact);
                console.log(step);
                steps = html`${steps}<p>${unsafeHTML(step)}</p>`;
            });
            let clazz = this.makeid(8);
            preparation = html`${preparation}
    <div class="${clazz} preparation">
        ${steps}
    </div>
    <style>
    .${clazz} {
        grid-area: ${2 + y_pos + this.all.length + 1}/1;
    }
    @media (min-width: 768px) {
        .${clazz} {
            grid-area: ${2 + y_pos}/2;
        }
    }
    </style>`;
        }

        let ingredientSwitch = html``;
        if (!this.compact) {
            ingredientSwitch = html`<a @click=${() => { this.compact = !this.compact; }}><h2>Zutaten</h2></a>
            `;
            ingredientSwitch = html`<div id="ingredients">${ingredientSwitch}</div>${ingredients}`;
        }

        let equipment = html``;
        let eq = false;
        for (let tag of this.data.equipment) {
            equipment = html`${equipment}<a class="tags" onclick="loadingComp.navigate('/tags?${tag}')" id="tag_${tag}" title="${tagTranslator[tag]}"><img alt="${tagTranslator[tag]}" src="icons/${tag}.svg" /></a>`;
            eq = true;
        }
        if (eq) {
            equipment = html`<div class="recipe-equipment"><h2>Benötigt</h2>${equipment}</div>`;
        }

        console.log(equipment);

        dialogComp.close();
        loadingComp.close();

        document.title = `${this.data.name.replaceAll('&shy;', '')} | Sandr0s Rezepte`;

        return html`
<div class="hdr">
<h1><a id="mainLink" onclick="loadingComp.navigate('/')">Rezept</a> - ${unsafeHTML(this.data.name)}</h1>
</div>
<div class="grid-recipe" id="recipe">
    ${images}
    ${ingredientSwitch}
    <div class="preparation-hdr">
        <h2><a @click=${() => { this.compact = !this.compact; }}>${ this.compact ? unsafeHTML(icon(faBars).html[0]) : ''} Zubereitung</a>
        <a class="edit ${getCookie('admin') == 'true' ? '' : 'hide-admin'}" href="https://github.com/Sandr0x00/recipes/edit/master/recipes/${this.data.id}.json">${unsafeHTML(icon(faEdit).html[0])}</a>
        </h2>
    </div>
    <style>
    .preparation-hdr {
        grid-area: ${2 + this.all.length + 1}/1;
    }
    @media (min-width: 768px) {
        .preparation-hdr {
            grid-area: 2/2;
        }
    }
    </style>
    ${preparation}
    ${equipment}
    ${tags}
</div>`;
    }

    updated(changedProperties) {
        if (this.all && this.all.length != 0) {
            window.recipeComp = document.getElementById('recipeComp');
            this.lazyLoadImg();
            $('#mainLink').off();
            document.getElementById('mainLink').addEventListener('auxclick', e => {
                if (e.which == 2) {
                    e.preventDefault();
                    window.open('/', '_blank');
                }
            });
        }
        if (changedProperties.has('recipe') && this.recipe) {
            this.loadStuff();
        }
    }

    // make unique id for grid-stuff. in theory collision happens in 1/length**52 cases, good enough
    makeid(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < length; i++) {
           result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    highlightOn(c) {
        $('.' + c).addClass('highlight');
        $('.all').addClass('highlight');
    }

    highlightOff(c) {
        $('.' + c).removeClass('highlight');
        $('.all').removeClass('highlight');
    }

    getSecondClass(elem) {
        return '.' + $(elem).attr('class').split(' ')[0];
    }

    async lazyLoadImg(){
        let list = document.getElementsByClassName('placeholder');
        for (let i = 0; i < list.length; i++) {
            let element = list[i];
            let large = element.getAttribute('data-large');
            if (!large) {
                return;
            }
            let bgImg = new Image();
            bgImg.onload = () => {
                element.style['background-image'] = `url('${bgImg.src}')`;
                element.classList.remove('blur');
            };
            bgImg.src = large;
        }
    }

    loadAdditionalRecipes() {
        return;
        if (!this.data || !this.data['link'] || this.data['link'].length == 0) {
            return;
        }
        for (let l of this.data['link']) {
            fetch(`recipes/${l}.json`).then(response => {
                if (response.status === 404) {
                    return Promise.reject(`Recipe for "${this.recipe}" does not exist.`);
                }
                return response;
            }).then(response => response.json()
            ).then(data => {
                this.all.push(data);
                this.requestUpdate();
            }).catch(err => {
                if (err) {
                    dialogComp.show(err);
                }
            });
        }
    }

    loadStuff() {
        if (!this.recipe) {
            return;
        }
        fetch(`recipes/${this.recipe}.json`).then(response => {
            if (response.status === 404) {
                return Promise.reject(`Recipe for "${this.recipe}" does not exist.`);
            }
            return response;
        }).then(response => response.json()
        ).then(data => {
            this.all = [];
            this.data = data;
            this.all.push(data);
            this.requestUpdate();
            this.loadAdditionalRecipes();
        }).catch(err => {
            if (err) {
                dialogComp.show(err);
            }
        });
    }
}

customElements.define('recipe-comp', Recipe);
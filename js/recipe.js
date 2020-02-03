/* global loadingComp, dialogComp */

import {html} from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import tagTranslator from './tags.js';
import {BaseComp} from './base.js';
import $ from 'jquery';
import { icon } from '@fortawesome/fontawesome-svg-core';
import { faExternalLinkAlt, faBars } from '@fortawesome/free-solid-svg-icons';
import credits from './credits.js';

class Recipe extends BaseComp {

    static get properties() {
        return {
            recipe: { type: String },
            data: { type: Object },
            compact: Boolean
        };
    }

    constructor() {
        super();
        loadingComp.open();
        this.recipe = null;
        this.data = null;
        this.compact = false;
    }

    render() {
        if (!this.data) {
            return html``;
        }
        // Images
        let images = html``;
        if (this.data.images) {
            if (this.data.images.length == 1) {
                images = html`
${images}
<div class="recipeImage one-image">
    <div class="placeholderWrapper">
        <div class="placeholder blur" data-large='images/${this.data.images[0]}' style="background-image: url('images/placeholder_${this.data.images[0]}');">
        </div>
    </div>
</div>`;
            } else {
                this.data.images.forEach(img => {
                    images = html`
${images}
<div class="recipeImage two-images">
    <div class="placeholderWrapper">
        <div class="placeholder blur" data-large='images/${img}' style="background-image: url('images/placeholder_${img}');">
        </div>
    </div>
</div>`;
                });
            }
            images = html`<div class="images">${images}</div>`;
        }

        // Ingredients
        let ingredients = html``;
        this.data.ingredients.forEach(ingredient => {
            let i = html``;
            if (ingredient.link) {
                i = html`
<span> </span>
<a onclick="loadingComp.navigate('${ingredient.link}')">${unsafeHTML(icon(faExternalLinkAlt).html)}</a>`;
            }
            ingredients = html`
${ingredients}
<li class="${ingredient.id} ingredient min-w" onmouseover="window.recipeComp.highlightOn('${ingredient.id}')" onmouseout="window.recipeComp.highlightOff('${ingredient.id}')">
    ${(ingredient.amount ? ingredient.amount + ' ' : '') + ingredient.name}
    ${i}
</li>`;

        });

        // Tags
        let tags = this.data.tags.map(tag => {
            let translated = tagTranslator[tag];
            return html`<a class="tags" onclick="loadingComp.navigate('/tag/${tag}')" id="tag_${tag}">${translated}</div>`;
        });
        tags = html`<div class="recipe-tags">${tags}</div>`;

        // Preparation
        let steps = html``;
        if (this.compact) {
            this.data.preparationAmounts.forEach(step => {
                steps = html`${steps}<p>${unsafeHTML(step)}</p>`;
            });
        } else {
            this.data.preparation.forEach(step => {
                steps = html`${steps}<p>${unsafeHTML(step)}</p>`;
            });
        }
        let preparation = html`
<div class="shrink animate preparation" id="preparation">
    <h2><a @click=${() => { this.compact = !this.compact; }}>${unsafeHTML(icon(faBars).html)}</a> Zubereitung</h2>
    ${steps}
</div>`;
/* <div class="shrink d-none animate preparation" id="preparation-amounts">
    <h2>Zubereitung</h2>
    ${stepsAmount}
</div>`; */
        let ingredientSwitch = html``;
        if (this.compact) {
            ingredientSwitch = html`<div class="ingredients text-center" id="ingredients-vert">
            <a class="vert" @click=${() => { this.compact = !this.compact; }}><h2>Zutaten</h2></a>
        </div>`;
        } else {
            ingredientSwitch = html`<div class="justify-content-center ingredients" id="ingredients">
            <a @click=${() => { this.compact = !this.compact; }}><h2>Zutaten</h2></a>
            <div class="h-100 o-hidden" id="inglist">
                <ul>
                    ${ingredients}
                </ul>
                ${this.data.portions ? html`<h4>${this.data.portions}</h4>` : html``}
            </div>
        </div>`;

        }

        dialogComp.close();
        loadingComp.close();
        return html`
<div>
<h1><a id="mainLink" onclick="loadingComp.navigate('/')">Rezept</a> - ${this.data.name}</h1>
</div>
<div class="grid-recipe" id="recipe">
    ${images}
    ${ingredientSwitch}
    ${preparation}
    ${tags}
    <div class="credits">
        <a class="float-right" id="credits" @click=${() => {
            dialogComp.show(credits);
        }}>Credits</a>
    </div>
</div>`;
    }

    updated(changedProperties) {
        if (changedProperties.has('data') && this.data) {
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

    highlightOn(c) {
        $('.' + c).addClass('highlight');
    }

    highlightOff(c) {
        $('.' + c).removeClass('highlight');
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

    loadStuff() {
        if (!this.recipe) {
            return;
        }
        fetch('api/recipe/' + this.recipe).then(response => {
            if (response.status === 404) {
                return Promise.reject(`Recipe for "${this.recipe}" does not exist.`);
            }
            return response;
        }).then(response => response.json()
        ).then(data => {
            this.data = data;
        }).catch(err => {
            if (err) {
                dialogComp.show(err);
            }
        });
    }
}

customElements.define('recipe-comp', Recipe);
/* global loadingComp, dialogComp, tagTranslator */

import {html} from 'https://unpkg.com/lit-element/lit-element.js?module';
import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html.js?module';
import {BaseComp} from './base.js';

class Recipe extends BaseComp {

    static get properties() {
        return {
            recipe: { type: String },
            data: { type: Object }
        };
    }

    constructor() {
        super();
        loadingComp.open();
        this.recipe = null;
        this.data = null;
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
<div class="recipeImage col-12 col-sm-10 offset-sm-1 col-lg-6 offset-lg-3">
    <div class="placeholderWrapper">
        <div class="placeholder blur" data-large='images/${this.data.images[0]}' style="background-image: url('images/placeholder_${this.data.images[0]}');">
        </div>
    </div>
</div>`;
            } else {
                this.data.images.forEach(img => {
                    images = html`
${images}
<div class="recipeImage col-6">
    <div class="placeholderWrapper">
        <div class="placeholder blur" data-large='images/${img}' style="background-image: url('images/placeholder_${img}');">
        </div>
    </div>
</div>`;
                });
            }
            images = html`<div class="row images">${images}</div>`;
        }

        // Ingredients
        let ingredients = html``;
        this.data.ingredients.forEach(ingredient => {
            let i = html``;
            if (ingredient.link) {
                i = html`
<span> </span>
<a onclick="loadingComp.navigate('${ingredient.link}')"><i class="fas fa-external-link-alt"></i></a>`;
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
        tags = html`<div class="col-12">${tags}</div>`;

        // Preparation
        let steps = html``;
        this.data.preparation.forEach(step => {
            steps = html`${steps}<p>${unsafeHTML(step)}</p>`;
        });
        let stepsAmount = html``;
        this.data.preparationAmounts.forEach(step => {
            stepsAmount = html`${stepsAmount}<p>${unsafeHTML(step)}</p>`;
        });

        let preparation = html`
<div class="col-sm-12 col-md-8 shrink animate" id="preparation">
    <h2>Zubereitung</h2>
    ${steps}
</div>
<div class="col-md-11 shrink d-none animate id="preparation-amounts
    <h2>Zubereitung</h2>
    ${stepsAmount}
</div>`;

        dialogComp.close();
        loadingComp.close();
        return html`
<div class="col-12">
<h1><a onclick="loadingComp.navigate('/')">Recipe</a> - ${this.data.name}</h1>
</div>
${images}
<div class="row" id="recipe">
    <div class="col-md-4 justify-content-center grow animate" id="ingredients">
        <a class="fadeOut"><h2 class="text-center"><i class="fas fa-bars"></i> Zutaten</h2></a>
        <div class="h-100 o-hidden" id="inglist">
            <ul class="list-unstyled">
                ${ingredients}
            </ul>
            ${this.data.portions ? html`<h5>${this.data.portions}</h5>` : html``}
        </div>
    </div>
    <div class="col-sm-12 col-md-1 d-none animate" id="ingredients-vert.vert">
        <a class="fadeIn"><h2 class="text-center">Zutaten</h2></a>
    </div>
    ${preparation}
    ${tags}
</div>`;
    }

    updated(changedProperties) {
        if (changedProperties.has('data') && this.data) {
            window.recipeComp = document.getElementById('recipeComp');
            this.lazyLoadImg();
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
                element.style['background-image'] = 'url(' + bgImg.src + ')';
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
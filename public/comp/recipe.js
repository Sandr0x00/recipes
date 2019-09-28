/* global loadingComp, dialogComp */

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
        <div class="placeholder blur" data-large='/images/${this.data.images[0]}' style="background-image: url('/images/placeholder_${this.data.images[0]}');">
        </div>
    </div>
</div>`;
            } else {
                this.data.images.forEach(img => {
                    images = html`
${images}
<div class="recipeImage col-6">
    <div class="placeholderWrapper">
        <div class="placeholder blur" data-large='/images/${img}' style="background-image: url('/images/placeholder_${img}');">
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
            if (ingredient.link) {
                ingredients = html`
${ingredients}
<li class="${ingredient.id} ingredient min-w">
    <a class="lnk" href="#" data-link="${ingredient.id}>${(ingredient.amount ? ingredient.amount + ' ' : '') + ingredient.name}"></a>
    <span> </span>
    <a href="${ingredient.link}"><i class="fas fa-external-link-alt"></i></a>
    ${ingredient.optional ? '<span class="optional"> - optional</span>' : ''}
</li>`;
            } else {
                ingredients = html`
${ingredients}
<li class="${ingredient.id} + " ingredient min-w">${(ingredient.amount ? ingredient.amount + ' ' : '') + ingredient.name}</li>
    ${ingredient.optional ? '<span class="optional"> - optional</span>' : ''}
</li>`;
            }
        });

        // Tags
        let tags = html``;
        this.data.tags.forEach(tag => {
            tags = html`${tags}<a class="tags" id="${tag}">${tag}</div>`;
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

        loadingComp.close();
        return html`
<div class="col-12">
<h1>${this.data.name}</h1>
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
            console.log(this.data);
            this.lazyLoadImg();
            this.data.tags.forEach(tag => {
                $('#' + tag).click(() => {
                    window.router.navigate('/tag/' + tag);
                });
            });
        }
        if (changedProperties.has('recipe') && this.recipe) {
            console.log(this.recipe);
            this.loadStuff();
        }
    }

    async lazyLoadImg(){
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

    single(r) {
        let type = '';
        if (r.type) {
            type = html`
<span class="type" style='background-image: url("/icons/${r.type}.svg"); background-size: 35px;'></span>`;
        }
        return html`
<figure class="col-6 col-sm-4 col-md-3 col-lg-2 recipeLinkDiv">
  <a id="${r.id}" class="lazy recipeLink" href="/recipe/${r.id}">
    <figcaption class="text-center">${r.name}</figcaption>
  </a>
  ${type}
</figure>`;
    }

    loadStuff() {
        if (!this.recipe) {
            return;
        }
        fetch('/api/recipe/' + this.recipe).then(response => {
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
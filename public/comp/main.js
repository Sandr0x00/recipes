import {html} from 'https://unpkg.com/lit-element/lit-element.js?module';
import Navigo from 'https://unpkg.com/navigo@7.1.2/lib/navigo.es.js';
import {BaseComp} from './base.js';

class Router extends BaseComp {
    static get properties() {
        return {
            route: { type: Object },
            recipe: { type: String }
        };
    }
    constructor() {
        super(); // Must call super in constructor
        window.router = new Navigo(null, true, '#!');
        window.router.on('/tag/:tag', (params) => {
            this.route = html`<recipes-comp class="row" id="recipesComp" load="tag/${params.tag}"></recipes-comp>`;
        }).on('/:recipe', (params) => {
            this.route = html`<recipe-comp id="recipeComp" recipe="${params.recipe}"></recipe-comp>`;
        }).on('*', () => {
            this.route = html`<recipes-comp class="row" id="recipesComp" load="all"></recipes-comp>`;
        }).resolve();
    }

    render() {
        return this.route;
    }
}
customElements.define('recipes-router', Router);
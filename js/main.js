import {html} from 'lit-element';
import Navigo from 'navigo';
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
        window.router.on('/tags', (params, query) => {
            this.route = html`<recipes-comp class="row" id="recipesComp" load="${query}"></recipes-comp>`;
        }).on('/:recipe', (params) => {
            this.route = html`<recipe-comp id="recipeComp" recipe="${params.recipe}"></recipe-comp>`;
        }).on('*', () => {
            this.route = html`<recipes-comp class="row" id="recipesComp" load=""></recipes-comp>`;
        }).resolve();
    }

    render() {
        return this.route;
    }
}
customElements.define('recipes-router', Router);
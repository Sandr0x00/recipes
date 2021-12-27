import { html } from 'lit';
import Navigo from 'navigo';
import { BaseComp } from './base.js';

class Router extends BaseComp {
    static get properties() {
        return {
            route: { type: Object }
        };
    }
    constructor() {
        super(); // Must call super in constructor
        window.router = new Navigo('/');
        window.router.on('/tags', params => {
            this.route = html`<recipes-comp class="row" id="recipesComp" load="${params.queryString}"></recipes-comp>`;
        }).on('/settings', () => {
            dialogComp.showSettings();
        }).on('/:recipe', params => {
            this.route = html`<recipe-comp id="recipeComp" recipe="${params.data.recipe}"></recipe-comp>`;
        }).on('*', () => {
            this.route = html`<recipes-comp class="row" id="recipesComp" load=""></recipes-comp>`;
        }).resolve();
    }

    render() {
        return this.route;
    }
}
customElements.define('recipes-router', Router);
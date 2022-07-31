/* global dialogComp */

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
        window.router.on('/recipes/tags', params => {
            this.route = html`<recipes-comp class="row" id="recipesComp" load="${params.queryString}"></recipes-comp>`;
        }).on('/recipes/settings', () => {
            dialogComp.showSettings();
        }).on('/recipes/:recipe', params => {
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
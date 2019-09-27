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
        window.router = new Navigo(null, false);
        window.router.on('tag/:tag', (params) => {
            window.tag = params.tag;
            this.route = html`<recipes-comp class="row"></recipes-comp>`;
        }).on(':recipe', (params) => {
            window.recipe = params.recipe;
            this.route = html`<recipe-comp></recipe-comp>`;
        }).on('*', () => {
            window.tag = null;
            this.route = html`<recipes-comp class="row"></recipes-comp>`;
        });
        window.router.resolve();
    }

    render() {
        return this.route;
    }
}
customElements.define('recipes-router', Router);
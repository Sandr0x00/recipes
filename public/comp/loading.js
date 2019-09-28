/* global */

import {html} from 'https://unpkg.com/lit-element/lit-element.js?module';
import {BaseComp} from './base.js';

export class DialogErrorComp extends BaseComp {

    static get properties() {
        return {
            loading: Boolean,
        };
    }
    constructor() {
        super();
        this.loading = true;
    }

    open() {
        this.loading = true;
    }
    close() {
        this.loading = false;
    }

    render() {
        if (!this.loading) {
            return html``;
        } else {
            let items = ['avocado', 'fried-egg', 'radish', 'steak', 'toast', 'tomato', 'pumpkin', 'cabbage', 'cheese', 'corn'];
            return html`
<div class="bg"></div>
<div class="col text-center">
<img class="loading" height="100px" width="100px" src="/icons/${items[Math.floor(Math.random() * items.length)]}.svg"/>
</div>`;
        }
    }
}

customElements.define('loading-dialog', DialogErrorComp);
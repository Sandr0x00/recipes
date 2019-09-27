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
            return html`
<div class="bg-load"></div>
<div class="col text-center loading">
  <i class="fas fa-yin-yang fa-spin fa-5x"></i>
</div>
<style>
.bg-load {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: #000;
    z-index: 9;
    opacity: 0.4;
}
.loading {
    z-index: 10;
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
}
</style>
`;
        }
    }
}

customElements.define('loading-dialog', DialogErrorComp);
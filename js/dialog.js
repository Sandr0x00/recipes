/* global loadingComp, dialogComp */

import { html } from 'lit';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { BaseComp } from './base.js';

export class DialogComp extends BaseComp {

    static get properties() {
        return {
            msg: String,
        };
    }

    constructor() {
        super();
        this.msg = '';
    }

    show(msg) {
        dialogComp.style.display = 'grid';
        this.msg = msg;
        loadingComp.close();
    }

    close() {
        dialogComp.style.display = 'none';
        this.msg = '';
    }

    render() {
        if (this.msg === '') {
            return html``;
        } else {
            return html`
<div class="bg" @click=${() => this.close()}></div>
<div id="dialog">
    ${unsafeHTML(this.msg)}
</div>`;
        }
    }
}

customElements.define('dialog-comp', DialogComp);
/* global loadingComp */

import {html} from 'https://unpkg.com/lit-element/lit-element.js?module';
import {BaseComp} from './base.js';

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
        this.msg = msg;
        console.log(this.msg);
        loadingComp.close();
    }

    close() {
        this.msg = '';
    }

    render() {
        if (this.msg === '') {
            return html``;
        } else {
            return html`
<div class="bg"></div>
<div class="row">
    <div id="dialog" class="col-12 col-sm-12 offset-md-2 col-md-8 offset-lg-2 col-lg-8 offset-xl-3 col-xl-6">
        ${this.msg}
    </div>
</div>
<style>
.dialog {
    z-index: 10;
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
}
</style>`;
        }
    }
}

customElements.define('dialog-comp', DialogComp);
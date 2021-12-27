/* global loadingComp, dialogComp */

import { html } from 'lit';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { BaseComp } from './base.js';

import $ from 'jquery';

import { icon } from '@fortawesome/fontawesome-svg-core';
import { faLock, faLockOpen, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { setCookie, getCookie, dark, light } from './cookies.js';


export class DialogComp extends BaseComp {

    static get properties() {
        return {
            msg: String
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

    switchTheme() {
        if (getCookie('theme') == dark()) {
            setCookie('theme', light());
            $('#theme').html(icon(faSun).html);
            $('body').removeClass(dark());
            $('body').addClass(light());
        } else {
            setCookie('theme', dark());
            $('#theme').html(icon(faMoon).html);
            $('body').removeClass(light());
            $('body').addClass(dark());
        }
    }

    switchAdmin() {
        if (getCookie('admin') == 'true') {
            setCookie('admin', 'false');
            $('#admin').html(icon(faLock).html);
            $('.edit').addClass('hide-admin');
        } else {
            setCookie('admin', 'true');
            $('#admin').html(icon(faLockOpen).html);
            $('.edit').removeClass('hide-admin');
        }
    }

    showSettings() {
        let theme = getCookie('theme');
        let admin = getCookie('admin');

        let msg = html`
<span class="setting-icon" id="theme" @click=${() => { this.switchTheme(); }}>${unsafeHTML(icon(theme == dark() ? faMoon : faSun).html[0])}</span><br>
<span class="setting-icon" id="admin" @click=${() => { this.switchAdmin(); }}>${unsafeHTML(icon(admin == 'true' ? faLockOpen : faLock).html[0])}</span>
`;
        this.show(msg);
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
    ${this.msg}
</div>`;
        }
    }
}

customElements.define('dialog-comp', DialogComp);
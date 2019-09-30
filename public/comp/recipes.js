/* global loadingComp, dialogComp, tagTranslator */

import {html} from 'https://unpkg.com/lit-element/lit-element.js?module';
import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html.js?module';
import {BaseComp} from './base.js';

class Recipes extends BaseComp {

    static get properties() {
        return {
            load: String,
            data: Array,
            tags: Array
        };
    }

    constructor() {
        super();
        loadingComp.open();
        this.data = [];
        this.tags = [];
        this.loadTags();
    }

    render() {
        let title = html``;
        if (this.load.startsWith('tag/')) {
            let translated = tagTranslator[this.load.split('/')[1]];
            title = html`<a onclick="loadingComp.navigate('/')">Rezepte</a> - ${translated}`;
        } else {
            title = html`<a onclick="loadingComp.navigate('/');loadingComp.close();">Rezepte</a>`;
        }
        dialogComp.close();
        loadingComp.close();
        console.log(this.data);
        return html`
<div class="col-12"><h1>${title}</h1></div>
<div class="col-12">${this.tags.map(t => this.singleTag(t))}</div>
${this.data.map(i => this.single(i))}`;
    }

    updated(changedProperties) {
        if (changedProperties.has('data')) {
            this.lazyLoadImg();
            for (const elem of this.data) {
                $('#' + elem.id).fitText();
            }
        }
        if (changedProperties.has('load')) {
            this.loadStuff();
        }
    }

    async lazyLoadImg(){
        for (const elem of this.data) {
            let bgImg = new Image();
            bgImg.onload = () => {
                $('#' + elem.id).css('background-image', 'url("images/thumbnail_' + elem.images[0] + '")');
            };
            bgImg.onerror = () => {
                $('#' + elem.id).css('background-image', 'url("icons/unknown.svg")');
            };
            bgImg.src = 'images/thumbnail_' + elem.images[0];
        }
    }

    single(r) {
        let type = '';
        if (r.type) {
            type = html`<span class="type"></span><span class="type" style='background-image: url("icons/${r.type}.svg"); background-size: 35px;'></span>`;
        }
        return html`
<figure class="col-6 col-sm-4 col-md-3 col-lg-2 recipeLinkDiv">
  <a id="${r.id}" onclick="loadingComp.navigate('/${r.id}');" class="lazy recipeLink">
    <figcaption class="text-center">${r.name}</figcaption>
  </a>
  ${type}
</figure>`;
    }

    singleTag(tag) {
        let translated = tagTranslator[tag];
        return html`<a class="tags" onclick="loadingComp.navigate('/tag/${tag}')" id="tag_${tag}">${translated}</div>`;
    }

    // TODO: merge promises
    loadStuff() {
        fetch('api/' + this.load).then(response => {
            if (response.status === 404) {
                return Promise.reject(`Tag "${this.load}" does not exist, choose a tag from above.`);
            }
            return response;
        }).then(response => response.json()
        ).then(data => {
            this.data = data;
        }).catch(err => {
            if (err) {
                dialogComp.show(err);
            }
        });
    }

    loadTags() {
        fetch('api/tags').then(response => {
            if (response.status === 404) {
                return Promise.reject(null);
            }
            return response;
        }).then(response => response.json()
        ).then(data => {
            this.tags = data;
        }).catch(err => {
            if (err) {
                dialogComp.show(err);
            }
        });
    }
}

customElements.define('recipes-comp', Recipes);
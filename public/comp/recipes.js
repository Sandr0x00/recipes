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
        let title = '<a href="/">Rezepte</a>';
        if (this.load.startsWith('tag/')) {
            let translated = tagTranslator[this.load.split('/')[1]];
            if (translated) {
                title += ' - ' + translated;
            } else {
                title += ' ! ' + translated;
            }
        }
        dialogComp.close();
        loadingComp.close();
        return html`
<div class="col-12"><h1>${unsafeHTML(title)}</h1></div>
<div class="col-12">${this.tags.map(t => this.singleTag(t))}</div>
${Object.values(this.data).map(i => this.single(i))}`;
    }

    updated(changedProperties) {
        console.log(changedProperties);
        if (changedProperties.has('tags')) {
            console.log(this.tags);
            for (const elem of this.tags.values()) {
                $('#tag_' + elem).click(function() {
                    window.router.navigate('/tag/' + elem);
                });
            }
        }
        if (changedProperties.has('data')) {
            this.lazyLoadImg();
            for (const elem in this.data) {
                $('#' + elem).click(() => {
                    loadingComp.open();
                    window.router.navigate('/' + elem);
                });
            }
        }
        if (changedProperties.has('load')) {
            this.loadStuff();
        }
    }

    async lazyLoadImg(){
        for (const elem in this.data) {
            let bgImg = new Image();
            bgImg.onload = () => {
                $('#' + elem).css('background-image', 'url("/images/thumbnail_' + this.data[elem].image[0] + '")');
            };
            bgImg.onerror = () => {
                $('#' + elem).css('background-image', 'url("/icons/unknown.svg")');
            };
            bgImg.src = '/images/thumbnail_' + this.data[elem].image[0];
        }
    }

    single(r) {
        let type = '';
        if (r.type) {
            type = html`<span class="type"></span><span class="type" style='background-image: url("/icons/${r.type}.svg"); background-size: 35px;'></span>`;
        }
        return html`
<figure class="col-6 col-sm-4 col-md-3 col-lg-2 recipeLinkDiv">
  <a id="${r.id}" class="lazy recipeLink">
    <figcaption class="text-center">${r.name}</figcaption>
  </a>
  ${type}
</figure>`;
    }

    singleTag(tag) {
        let translated = tagTranslator[tag];
        return html`<a class="tags" href="/#!/tag/${tag}" id="tag_${tag}">${translated}</div>`;
    }

    // TODO: merge promises
    loadStuff() {
        fetch('/api/' + this.load).then(response => {
            console.log(response);
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
        fetch('/api/tags').then(response => {
            if (response.status === 404) {
                return Promise.reject(null);
            }
            return response;
        }).then(response => response.json()
        ).then(data => {
            console.log(data);
            this.tags = data;
            console.log(this.tags);
        }).catch(err => {
            if (err) {
                dialogComp.show(err);
            }
        });
    }
}

customElements.define('recipes-comp', Recipes);
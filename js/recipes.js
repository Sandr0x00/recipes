/* global loadingComp, dialogComp */

import {html} from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import tagTranslator from './tags.js';
import {BaseComp} from './base.js';
import { icon } from '@fortawesome/fontawesome-svg-core';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

class Recipes extends BaseComp {

    static get properties() {
        return {
            load: String,
            filter: Array,
            data: Array,
            tags: Array,
            filteredData: Array
        };
    }

    constructor() {
        super();
        loadingComp.open();
        this.data = [];
        this.tags = [];
        this.filter = [];
        this.filteredData = [];
        this.loadTags();
    }

    render() {
        let tags = this.tags.map(t => this.singleTag(t));
        let data = [];
        for (const [id, recipe] of Object.entries(this.filteredData)) {
            data.push(this.single(id, recipe));
        }
        dialogComp.close();
        loadingComp.close();
        return html`
<div class="grid-container">
<div class="grid-title"><h1><a id="mainLink" @click=${() => { this.clearFilter();loadingComp.navigate('/');loadingComp.close();}}">Rezepte</a></h1></div>
<div class="grid-tags nowrap">${tags}<a @click=${this.clearFilter} class="removeTags tags">${unsafeHTML(icon(faTimesCircle).html)}</a></div>
<div class="recipes-grid">
${data}
</div></div>`;
    }

    single(id, recipe) {
        return html`
<figure class="recipeLinkDiv">
  <a id="${id}" style="background-image: url('icons/unknown.svg')" class="recipeLink" @click=${() => { loadingComp.navigate(`/${id}`); }}>
    <figcaption class="text-center">${unsafeHTML(recipe.name)}</figcaption>
  </a>
</figure>`;
    }

    updated(changedProperties) {
        if (changedProperties.has('filteredData')) {
            this.lazyLoadImg();
            // for (const elem of this.filteredData) {
            //     // $('#' + elem.id).off();
            //     // $('#' + elem.id).on('auxclick', e => {
            //     //     e.preventDefault();
            //     //     loadingComp.navigate(`/${elem.id}`, '_blank');
            //     // });
            // }
            // $('#mainLink').off();
            // $('#mainLink').on('auxclick', e => {
            //     e.preventDefault();
            //     window.open('/', '_blank');
            // });
        }
        if (changedProperties.has('load')) {
            if (this.load.length != 0) {
                this.filter.push(this.load);
            }
            this.loadStuff();
        }
    }

    async lazyLoadImg(){
        for (const [id, recipe] of Object.entries(this.filteredData)) {
            let element = document.getElementById(id);
            let img = 'icons/unknown.svg';
            if (recipe.image) {
                img = 'images/thumbnail_' + recipe.image;
            }
            let bgImg = new Image();
            bgImg.onload = () => {
                element.style['background-image'] = `url("${img}")`;
                element.classList.remove('blur');
            };
            bgImg.onerror = () => {
                element.style['background-image'] = 'url("icons/unknown.svg")';
                element.classList.remove('blur');
            };
            bgImg.src = img;
        }
    }

    setFilter(tag) {
        let idx = this.filter.indexOf(tag);
        if (idx >= 0) {
            this.filter.splice(idx, 1);
        } else {
            this.filter.push(tag);
        }
        this.reloadFilters();
    }

    clearFilter() {
        this.filter = [];
        this.reloadFilters();
    }

    singleTag(tag) {
        let t = tag.tag;
        let c = tag.cnt;
        if (c < 5) {
            return html``;
        }
        let selected = false;
        for (let f of this.filter) {
            if (f == t) {
                selected = true;
            }
        }
        return html`<a class="tags ${selected ? 'selected' : ''}" @click=${() => this.setFilter(t)} id="tag_${t}" title="${tagTranslator[t]}"><img src="icons/${t}.svg" /> (${c})</a>`;
    }

    // TODO: merge all and tags
    loadStuff() {
        fetch('api/all').then(response => {
            if (response.status === 404) {
                return Promise.reject(`Tag "${this.load}" does not exist, choose a tag from above.`);
            }
            return response;
        }).then(response => response.json()
        ).then(data => {
            this.data = data;
            this.reloadFilters();
        }).catch(err => {
            if (err) {
                dialogComp.show(err);
            }
        });
    }

    reloadFilters() {
        if (this.filter.length == 0) {
            this.filteredData = this.data;
            return;
        }
        this.filteredData = {};
        for (const [id, recipe] of Object.entries(this.data)) {
            let matches = true;
            this.filter.forEach(f => {
                if (!recipe.tags.includes(f)) {
                    matches = false;
                    return;
                }
            });
            if (matches) {
                this.filteredData[id] = recipe;
            }
        }
    }

    // TODO: merge all and tags
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
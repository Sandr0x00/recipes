/* global loadingComp, dialogComp */

import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import tagTranslator from './tags.js';
import { BaseComp } from './base.js';
import { icon } from '@fortawesome/fontawesome-svg-core';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { isAdmin } from './cookies.js';

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

        let title = this.filter.map(t => ' ' + tagTranslator[t]);
        if (title.length > 0) {
            document.title = `${title} | sandr0s Rezepte`;
        } else {
            document.title = 'sandr0s Rezepte';
        }

        return html`
<div class="grid-container">
 <div class="grid-title"><h1><a href="https://sandr0.xyz"><img class="logo" src="/logo.svg"/></a> <a id="mainLink" @click=${() => { this.clearFilter();loadingComp.navigate('/');loadingComp.close();}}">Rezepte</a></h1></div>
 <div class="grid-tags nowrap">${tags}<a @click=${this.clearFilter} class="removeTags tags">${unsafeHTML(icon(faTimesCircle).html[0])}</a></div>
<div class="recipes-grid">
${data}
</div></div>`;
    }

    single(id, recipe) {
        return html`
<a class="preview-container" @click=${() => { loadingComp.navigate(`/${id}`); }}>
 <div class="preview-dummy"></div>
 <div class="preview-image-parent">
  <div id="${id}" class="preview-image-child" style="background-image: url('/icons/unknown.svg')" ></div>
 </div>
 <div class="preview-name">${unsafeHTML(recipe.name)}</div>
</a>`;
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
                let filters = this.load.split(',');
                // remove empty strings
                filters = filters.filter(Boolean);
                this.filter = filters;
            }
            this.loadStuff();
        }
    }

    async lazyLoadImg(){
        for (const [id, recipe] of Object.entries(this.filteredData)) {
            let element = document.getElementById(id);
            let img = '/icons/unknown.svg';
            if (recipe.image) {
                img = '/images/thumbnail_' + recipe.image;
            }
            let bgImg = new Image();
            bgImg.onload = () => {
                element.style['background-image'] = `url("${img}")`;
                element.classList.remove('blur');
            };
            bgImg.onerror = () => {
                element.style['background-image'] = 'url("/icons/unknown.svg")';
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
        window.history.pushState('','',`/tags?${this.filter}`);
        this.reloadFilters();
    }

    clearFilter() {
        this.filter = [];
        window.history.pushState('','','/');
        this.reloadFilters();
    }

    singleTag(tag) {
        let t = tag.tag;
        if (!isAdmin() && t == 'weed') {
            return html``;
        }
        // let c = tag.cnt;
        // if (c < 5) {
        //     return html``;
        // }
        let selected = false;
        for (let f of this.filter) {
            if (f == t) {
                selected = true;
            }
        }
        return html`<a class="tags ${selected ? 'selected' : ''}" @click=${() => this.setFilter(t)} id="tag_${t}" title="${tagTranslator[t]}"><img src="/icons/${t}.svg" /></a>`;
    }

    loadStuff() {
        fetch('/api/all').then(response => {
            if (response.status === 404) {
                return Promise.reject(`Server does not exist: ${response.status}`);
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
        this.filteredData = {};
        if (this.filter.length == 0) {
            if (!isAdmin()) {
                for (const [id, recipe] of Object.entries(this.data)) {
                    if (recipe.tags.includes('weed')) {
                        continue;
                    }
                    if (!recipe.image) {
                        continue;
                    }
                    this.filteredData[id] = recipe;
                }
            } else {
                this.filteredData = this.data;
            }
            return;
        }
        for (const [id, recipe] of Object.entries(this.data)) {
            if (!isAdmin()) {
                if (recipe.tags.includes('weed')) {
                    continue;
                }
                if (!recipe.image) {
                    continue;
                }
            }
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

    loadTags() {
        fetch('/api/tags').then(response => {
            if (response.status === 404) {
                return Promise.reject('Tags do not exist.');
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
/* global loadingComp */

import {html} from 'https://unpkg.com/lit-element/lit-element.js?module';
import {BaseComp} from './base.js';

class Recipes extends BaseComp {

    static get properties() {
        return {
            load: String,
            data: Array
        };
    }

    constructor() {
        super();
        loadingComp.open();
        this.data = [];
    }

    render() {
        return html`
<div class="col-12"><h1>Recipes</h1></div>
${Object.values(this.data).map(i => html`${this.single(i)}`)}`;
    }

    updated(changedProperties) {
        if (changedProperties.has('data')) {
            this.lazyLoadImg();
            for (const elem in this.data) {
                $('#' + elem).click(() => {
                    window.router.navigate(elem);
                });
            }
        }
    }

    firstUpdated() {
        console.log(window.tag)
        if (window.tag) {
            this.load = 'tag/' + window.tag;
        } else {
            this.load = 'all';
        }
        this.loadStuff();
    }

    async lazyLoadImg(){
        for (const elem in this.data) {
            let bgImg = new Image();
            bgImg.onload = () => {
                $('#' + elem).css('background-image', 'url("/images/thumbnail_' + this.data[elem].image[0] + '")');
            };
            bgImg.onerror = () => {
                $('#' + elem).css('background-image', 'url("/images/thumbnail_baiser.jpg")');
            };
            bgImg.src = '/images/thumbnail_' + this.data[elem].image[0];
        }
    }

    single(r) {
        let type = '';
        if (r.type) {
            type = html`<span class="type" style='background-image: url("/icons/${r.type}.svg"); background-size: 35px;'></span>`;
        }
        return html`
<figure class="col-6 col-sm-4 col-md-3 col-lg-2 recipeLinkDiv">
  <a id="${r.id}" class="lazy recipeLink">
    <figcaption class="text-center">${r.name}</figcaption>
  </a>
  ${type}
</figure>`;
    }

    loadStuff() {
        console.log(this.load);
        fetch('/api/' + this.load).then(response => {
            if (response.status === 401) {
                // dialogComp.close(true);
                // dialogComp.showLogin();
                return Promise.reject(null);
            }
            return response;
        }).then(response => response.json()
        ).then(data => {
            loadingComp.close();
            this.data = data;
        }).catch(err => {
            if (err) {
                loadingComp.close();
                console.log(err);
                // dialogComp.showError(err);
            }
        });
    }
}

customElements.define('recipes-comp', Recipes);
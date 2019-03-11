#!/usr/bin/env node

/* global __dirname, require, console, module */

const express = require('express');
const compression = require('compression');
const app = express();
const port = 3000;

let helper = require('./helper');

Object.filter = (obj, predicate) => {
    return Object.keys(obj)
          .filter(key => predicate(obj[key]))
          .reduce((res, key) => (res[key] = obj[key], res), {});
};

let json = helper.loadJSON();
let recipes = json['recipes'];
let categories = json['categories'];

app.set('view engine', 'pug');
app.locals.compileDebug = false;
app.locals.cache = true;
app.use(express.static('public'));
app.use(compression());

app.get('/api/:id', (req, res) => {
    let id = req.params.id;
    let recipe = findById(recipes, id);
    if (recipe) {
        res.send(recipe);
    }
});

app.get('/', (req, res) => {
    setHeaders(res);
    res.render('index', {
        recipes: recipes,
        categories: categories,
        title: 'Rezepte',
        breadcrumbs: [
            {
                link: '/',
                text: 'Rezepte'
            },
        ]
    });
});

app.get('/:cat', (req, res) => {
    setHeaders(res);
    let cat = req.params.cat;
    if (cat === 'credits') {
        res.render('credits', {
            title: 'Credits'
        });
    } else if (cat === 'reload-json') {
        json = helper.loadJSON();
        recipes = json['recipes'];
        categories = json['categories'];
        res.redirect('/');
    } else if (categories[cat]) {
        res.render('index', {
            recipes: Object.filter(recipes, r => r.category === cat),
            title: 'Rezepte',
            breadcrumbs: [
                {
                    link: '/',
                    text: 'Rezepte'
                },
                {
                    link: '/' + cat,
                    text: categories[cat].name
                }
            ]
        });
    } else {
        res.render('404');
    }
});

app.get('/:category/:recipe', (req,res) => {
    setHeaders(res);
    // let now = Date.now();
    let recipe = findById(recipes, req.params.recipe);
    if (recipe) {
        if (recipe.category != req.params.category && req.params.category != 'recipe') {
            console.log(recipe.category);
            console.log(req.params.category);

            res.render('404');
            return;
        }
        if (recipe.category === 'sandwich') {
            res.render('sandwich', recipe);
        } else {
            res.render('recipe', recipe);
        }
    } else {
        res.render('404');
    }
});


app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }
    console.log(`server is listening on ${port}`);
});


function findById(recipes, id) {
    for (let key in recipes) {
        let recipe = recipes[key];
        if (id != key) {
            continue;
        }
        let ret = {
            category: recipe.category,
            images: recipe.image,
            name: recipe.name,
            title: recipe.name,
            breadcrumbs: [
                {
                    link: '/',
                    text: 'Rezepte'
                },
                {
                    link: '/' + recipe.category,
                    text: categories[recipe.category].name
                },
                {
                    link: '/' + recipe.category + '/' + id,
                    text: recipe.name
                }
            ]

        };
        if (recipe.category == 'sandwich') {
            Object.assign(ret, {
                order: recipe.order,
            });
        } else {
            let prep = helper.formatPreparation(recipe);
            Object.assign(ret, {
                ingredients: recipe.ingredients,
                preparation: prep[0],
                preparationAmounts: prep[1],
                portions: recipe.portions
            });
        }
        return ret;
    }
    return null;
}


function setHeaders(res) {
    res.set('X-XSS-ProtectionType', '"1; mode=block"');
    res.set('X-Frame-Options', 'SAMEORIGIN');
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Strict-Transport-Security', '"max-age=31536000; includeSubDomains; preload"');
    res.set('Content-Security-Policy',
        'default-src \'self\';'
        + 'img-src \'self\';'
        + 'style-src \'self\' \'unsafe-inline\' use.fontawesome.com;'
        + 'script-src \'self\';'
        + 'font-src use.fontawesome.com');
    res.set('X-Permitted-Cross-Domain-Policies', '"none"');
    res.set('Referrer-Policy', 'no-referrer');
    res.set('Feature-Policy', 'accelerometer \'none\'; camera \'none\'; geolocation \'none\'; gyroscope \'none\'; magnetometer \'none\'; microphone \'none\'; payment \'none\'; usb \'none\'; sync-xhr \'none\'');
}
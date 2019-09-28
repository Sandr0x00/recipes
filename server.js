#!/usr/bin/env node

/* global require, process, __dirname */

const express = require('express');
const compression = require('compression');
const path = require('path');
const app = express();
let port = process.env.PORT;
if (port == null || port == '') {
    port = 8080;
}

let helper = require('./helper');

Object.filter = (obj, predicate) => {
    return Object.keys(obj)
          .filter(key => predicate(obj[key]))
          .reduce((res, key) => (res[key] = obj[key], res), {});
};

let json = helper.loadJSON();
let recipes = json['recipes'];
let tags = json.tags;
let general = helper.extractGeneralInfo(recipes);
// console.log(recipes);

app.set('view engine', 'pug');
app.locals.compileDebug = false;
app.locals.cache = true;
app.use(express.static('public'));
app.use(compression());

app.get('/api/all', (req, res) => {
    setHeaders(res);
    res.json(general);
});

app.get('/api/tags', (req, res) => {
    setHeaders(res);
    res.json(tags);
});

app.get('/api/recipe/:id', (req, res) => {
    let id = req.params.id;
    let recipe = findById(id);
    if (recipe) {
        res.json(recipe);
    } else {
        res.status(404);
        res.send();
    }
});

app.get('/api/tag/:tag', (req, res) => {
    let tag = req.params.tag;
    let r = findByTag(tag);
    r = helper.extractGeneralInfo(r);
    if (r && Object.keys(r).length !== 0) {
        res.json(r);
    } else {
        res.status(404);
        res.send();
    }
});

// app.get('*', (req, res) => {
//     setHeaders(res);
//     res.sendFile(path.join(__dirname + '/public/index.html'));
// });

// app.get('/*', (req, res) => {
//     setHeaders(res);
//     console.log(path.join(__dirname + '/public/index.html'));
//     // res.render('index', {
//     //     recipes: recipes,
//     //     // categories: categories,
//     //     title: 'Rezepte',
//     //     breadcrumbs: [
//     //         {
//     //             link: '/',
//     //             text: 'Rezepte'
//     //         },
//     //     ]
//     // });
// });

// app.get('/:cat', (req, res) => {
//     setHeaders(res);
//     let cat = req.params.cat;
//     if (cat === 'credits') {
//         res.render('credits', {
//             title: 'Credits'
//         });
//     } else if (cat === 'reload-json') {
//         json = helper.loadJSON();
//         recipes = json['recipes'];
//         // categories = json['categories'];
//         res.redirect('/');
//     // } else if (categories[cat]) {
//     //     res.render('index', {
//     //         recipes: Object.filter(recipes, r => r.category === cat),
//     //         title: 'Rezepte',
//     //         breadcrumbs: [
//     //             {
//     //                 link: '/',
//     //                 text: 'Rezepte'
//     //             },
//     //             {
//     //                 link: '/' + cat,
//     //                 text: categories[cat].name
//     //             }
//     //         ]
//     //     });
//     } else {
//         res.render('404');
//     }
// });

// app.get('/:category/:recipe', (req,res) => {
//     setHeaders(res);
//     // let now = Date.now();
//     let recipe = findById(recipes, req.params.recipe);
//     if (recipe) {
//         if (recipe.category != req.params.category && req.params.category != 'recipe') {
//             console.log(recipe.category);
//             console.log(req.params.category);

//             res.render('404');
//             return;
//         }
//         if (recipe.category === 'sandwich') {
//             res.render('sandwich', recipe);
//         } else {
//             res.render('recipe', recipe);
//         }
//     } else {
//         res.render('404');
//     }
// });


app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }
    console.log(`server is listening on ${port}`);
});

// TODO: make smaller, fuck the manual shit.
function findByTag(tag) {
    let r = {};
    for (let key in recipes) {
        let recipe = recipes[key];
        if (!recipe.tags.includes(tag)) {
            continue;
        }
        // let ret = {
        //     category: recipe.category,
        //     images: recipe.image,
        //     name: recipe.name,
        //     title: recipe.name,
        //     tags: recipe.tags,
        //     id: recipe.id
        // };
        // let prep = helper.formatPreparation(recipe);
        // Object.assign(ret, {
        //     ingredients: recipe.ingredients,
        //     preparation: prep[0],
        //     preparationAmounts: prep[1],
        //     portions: recipe.portions
        // });
        r[recipe.id] = recipe;
    }
    return r;
}


// TODO: make smaller, fuck the manual shit.
function findById(id) {
    for (let key in recipes) {
        if (id != key) {
            continue;
        }
        let recipe = recipes[key];
        let ret = {
            category: recipe.category,
            images: recipe.image,
            name: recipe.name,
            title: recipe.name,
            tags: recipe.tags,
        };
        let prep = helper.formatPreparation(recipe);
        Object.assign(ret, {
            ingredients: recipe.ingredients,
            preparation: prep[0],
            preparationAmounts: prep[1],
            portions: recipe.portions
        });
        return ret;
    }
    return null;
}


function setHeaders(res) {
    res.setHeader('X-XSS-ProtectionType', '"1; mode=block"');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Strict-Transport-Security', '"max-age=31536000; includeSubDomains; preload"');
    res.setHeader('Content-Security-Policy',
        'default-src \'self\';'
        + 'img-src \'self\';'
        + 'style-src \'self\' \'unsafe-inline\' use.fontawesome.com;'
        + 'script-src \'self\' \'unsafe-inline\' unpkg.com;'
        + 'font-src use.fontawesome.com');
    res.setHeader('X-Permitted-Cross-Domain-Policies', '"none"');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Feature-Policy', 'accelerometer \'none\'; camera \'none\'; geolocation \'none\'; gyroscope \'none\'; magnetometer \'none\'; microphone \'none\'; payment \'none\'; usb \'none\'; sync-xhr \'none\'');
}
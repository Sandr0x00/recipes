#!/usr/bin/env node

/* global __dirname, require, console, module */

const express = require('express');
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

app.get('/', (req, res) => {
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
    let cat = req.params.cat;
    if (cat === 'credits') {
        res.render('credits', {title: 'Credits'});
    } else if (cat === 'reload-json') {
        json = helper.loadJSON();
        recipes = json['recipes'];
        categories = json['categories'];
        res.redirect('/');
    } else if (categories.indexOf(cat) >= 0) {
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
                    text: cat
                }
            ]
        });
    } else {
        res.render('404');
    }
});

app.get('/:category/:recipe', (req,res) => {
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
                    text: recipe.category
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

#!/usr/bin/env node

/* global __dirname, require, console */

const express = require('express');
const app = express();
const port = 3000;

let fs = require('fs');
let path = require('path');

Object.filter = (obj, predicate) => {
    return Object.keys(obj)
          .filter(key => predicate(obj[key]))
          .reduce((res, key) => (res[key] = obj[key], res), {});
};

// let recipes = temp[0];
// let categories = temp[1];
let recipes = {};
let categories = [];
loadJSON();

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
        loadJSON();
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
            let prep = formatPreparation(recipe);
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

function formatPreparation(recipe) {
    // replace preparations
    let preparation = JSON.stringify(recipe.preparation);
    let preparationAmounts = JSON.stringify(recipe.preparation);
    recipe.ingredients.forEach(ingredient => {
        let regex = `\{${ingredient.id}\}`;
        let replace = '<b class=\'' + ingredient.id + ' ingredient\'>' + ingredient.name + '</b>';
        let replaceAmounts = '<b class=\'' + ingredient.id + ' ingredient\'>' + (ingredient.amount ? ingredient.amount + ' ' : '') + ingredient.name + '</b>';
        preparation = preparation.replace(new RegExp(regex, 'g'), replace);
        preparationAmounts = preparationAmounts.replace(new RegExp(regex, 'g'), replaceAmounts);
    });
    return [
        JSON.parse(preparation),
        JSON.parse(preparationAmounts)
    ];
}

function loadJSON() {
    recipes = {};
    categories = [];
    let dirPath = path.join(__dirname, 'recipes');
    fs.readdirSync(dirPath).forEach(dirname => {
        categories.push(dirname);
        let filePath = path.join(dirPath, dirname);
        let stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            Object.assign(recipes, readFilesInFolder(dirname));
        } else if (stats.isFile()) {
            console.log('There should be no file here!');
        }
    });
}

function readFilesInFolder(folder) {
    let recipes = {};
    let dirPath = path.join(__dirname, 'recipes', folder);
    fs.readdirSync(dirPath).forEach(dirname => {
        let filePath = path.join(dirPath, dirname);
        let stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            console.log('There should be no directory here!');
        } else if (stats.isFile()) {
            let key = path.parse(dirname).name;
            recipes[key] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            recipes[key].id = key;
            recipes[key].category = folder;
        }
    });
    return recipes;
}

#!/usr/bin/env node

const express = require('express');
const app = express();
const port = 3000;

let fs = require('fs');
let recipes = loadJSON();
app.set('view engine', 'pug');
// app.locals.compileDebug = false;
// app.locals.cache = true;
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', {
        recipes: recipes,
    });
});
app.get('/credits', (req, res) => {
    res.render('credits');
});

app.get('/reload-json', (req, res) => {
    recipes = loadJSON();
    res.redirect('/');
});

app.get('/recipe/:recipe', (req,res) => {
    // let now = Date.now();
    let recipe = findById(recipes, req.params.recipe);
    if (recipe) {
        // console.log('PreRender: ' + (Date.now() - now))
        res.render('recipe', recipe);
        // console.log('AfterRender: ' + (Date.now() - now))
    } else {
        res.render('404');
    }
});

app.get('/sandwich/:recipe', (req,res) => {
    // let now = Date.now();
    let recipe = findById(recipes, req.params.recipe);
    if (recipe) {
        // console.log('PreRender: ' + (Date.now() - now))
        res.render('sandwich', recipe);
        // console.log('AfterRender: ' + (Date.now() - now))
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
        if (recipe.category == 'sandwich') {
            return {
                images: recipe.image,
                name: recipe.name,
                order: recipe.order
            };
        } else {
            prep = formatPreparation(recipe);
            return {
                ingredients: recipe.ingredients,
                preparation: prep[0],
                preparationAmounts: prep[1],
                images: recipe.image,
                name: recipe.name,
                portions: recipe.portions
            };
        }
    }
    return null;
}

function formatPreparation(recipe) {
    // replace preparations
    preparation = JSON.stringify(recipe.preparation);
    preparationAmounts = JSON.stringify(recipe.preparation);
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
    let rs = JSON.parse(fs.readFileSync('rezepte.json', 'utf8'));
    for (let key in rs) {
        rs[key].id = key;
    }
    return rs;
}
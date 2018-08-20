const express = require('express');
const app = express();
const port = 3000;

let fs = require('fs');
let recipes = loadJSON();
app.set('view engine', 'pug');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', {
        mains: recipes['mains'],
        deserts: recipes['deserts'],
    });
});

app.get('/reload-json', (req, res) => {
    recipes = loadJSON();
    res.redirect('/');
});

app.get('/desert/:recipe', (req,res) => {
    recipe = findById(recipes.deserts, req.params.recipe);
    if (recipe) {
        res.render('recipe', recipe);
    } else {
        res.render('404');
    }
});

app.get('/mains/:recipe', (req,res) => {
    recipe = findById(recipes.mains, req.params.recipe);
    if (recipe) {
        res.render('recipe', recipe);
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


function findById(arr, id) {
    for (let i = 0; i < arr.length; i++) {
        recipe = arr[i];
        if (recipe.id == id) {
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
        let replace = '<b class=\'ingredient ' + ingredient.id + '\'>' + ingredient.name + '</b>';
        let replaceAmounts = '<b class=\'ingredient ' + ingredient.id + '\'>' + (ingredient.amount ? ingredient.amount + ' ' : '') + ingredient.name + '</b>';
        preparation = preparation.replace(new RegExp(regex, 'g'), replace);
        preparationAmounts = preparationAmounts.replace(new RegExp(regex, 'g'), replaceAmounts);
    });
    return [ 
        JSON.parse(preparation),
        JSON.parse(preparationAmounts)
    ];
}

function loadJSON() {
    return JSON.parse(fs.readFileSync('rezepte.json', 'utf8'));
}
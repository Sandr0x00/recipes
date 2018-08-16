const express = require('express');
const app = express();
const port = 3000;

let fs = require('fs');
let recipes = JSON.parse(fs.readFileSync('rezepte.json', 'utf8'));
app.set('view engine', 'pug');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', {
        mains: recipes['mains'],
        deserts: recipes['deserts'],
    });
});

app.get('/desert/:recipe',function(req,res) {
    recipe = findById(recipes.deserts, req.params.recipe);
    if (recipe) {
        res.render('recipe', recipe);
    } else {
        res.render('404');
    }
});

app.get('/mains/:recipe',function(req,res) {
    recipe = findById(recipes.mains, req.params.recipe);
    if (recipe) {
        res.render('recipe', recipe);
    } else {
        res.render('404');
    }
});

function findById(arr, id) {
    for (let i = 0; i < arr.length; i++) {
        recipe = arr[i];
        if (recipe.id == id) {
            return {
                ingredients: recipe.ingredients,
                preparation: formatPreparation(recipe),
                images: recipe.image,
                name: recipe.name,
                portions: recipe.portions
            };
        }
    }
    return null;
}

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }

    console.log(`server is listening on ${port}`);
});

function formatPreparation(recipe) {
    // replace preparations
    preparation = JSON.stringify(recipe.preparation);
    recipe.ingredients.forEach(ingredient => {
        let regex = `\{${ingredient.id}\}`;
        let replace = '<b class=\'ingredient ' + ingredient.id + '\'>' + /*(ingredient.amount ? ingredient.amount + ' ' : '') +*/ ingredient.name + '</b>';
        preparation = preparation.replace(new RegExp(regex, 'g'), replace);
    });
    return JSON.parse(preparation);
}
/* global exports, require, __dirname */

let fs = require('fs');
let path = require('path');

function replace(regex, regexAmount, ingredient, preparation, preparationAmounts) {
    let replace;
    let replaceAmounts;
    if (preparation.match(regexAmount)) {
        let amount = preparation.match(regexAmount)[1];
        regex = `{${ingredient.id}:${amount}}`;
        replace = '<b class=\'' + ingredient.id + ' ingredient\'>' + amount + ' ' + ingredient.name + '</b>';
        replaceAmounts = replace;
    } else {
        replace = '<b class=\'' + ingredient.id + ' ingredient\'>' + ingredient.name + '</b>';
        replaceAmounts = '<b class=\'' + ingredient.id + ' ingredient\'>' + (ingredient.amount ? ingredient.amount + ' ' : '') + ingredient.name + '</b>';
    }
    preparation = preparation.replace(new RegExp(regex, 'g'), replace);
    preparationAmounts = preparationAmounts.replace(new RegExp(regex, 'g'), replaceAmounts);
    return [
        preparation,
        preparationAmounts
    ];
}

exports.formatPreparation = function(recipe) {
    // replace preparations
    let preparation = JSON.stringify(recipe.preparation);
    let preparationAmounts = JSON.stringify(recipe.preparation);
    recipe.ingredients.forEach(ingredient => {
        while (preparation.match(`{${ingredient.id}(:.+?)*}`)) {
            // first, replace ingredients with specific amounts, if there are any
            let regex = `{${ingredient.id}}`;
            let regex_amount = `{${ingredient.id}:(.+?)}`;
            let replaced = replace(regex, regex_amount, ingredient, preparation, preparationAmounts);
            preparation = replaced[0];
            preparationAmounts = replaced[1];
        }
    });
    return [
        JSON.parse(preparation),
        JSON.parse(preparationAmounts)
    ];
};

exports.loadJSON = function() {
    // let recipes = {};
    // let categories = {};
    let dirPath = path.join(__dirname, 'recipes');
    let stuff = readFilesInFolder(dirPath);
    // Object.assign(recipes, readFilesInFolder(dirPath));
    // fs.readdirSync(dirPath).forEach(dirname => {
    //     // // set categories
    //     // let category = {};
    //     // let metaPath = path.join(dirPath, dirname, '_meta.json');
    //     // category[dirname] = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    //     // category[dirname].id = dirname;
    //     // Object.assign(categories, category);

    //     // set recipes
    //     let filePath = path.join(dirPath, dirname);
    //     let stats = fs.statSync(filePath);
    //     if (stats.isDirectory()) {
    //     } else if (stats.isFile()) {
    //         console.log('There should be no file here!');
    //     }
    // });
    linkIngredients(stuff.recipes);
    return {recipes: stuff.recipes, tags: stuff.tags};// , categories: categories};
};

function linkIngredients(recipes) {
    let ids = Object.keys(recipes);
    for (let key in recipes) {
        let recipe = recipes[key];
        // if (recipe.category == 'sandwich') {
        //     continue;
        // }
        recipe.ingredients.forEach(ingredient => {
            if (ids.includes(ingredient.id)) {
                let linkedRecipe = recipes[ingredient.id];
                ingredient['link'] = '/' + linkedRecipe.id;
            }
        });
    }
}

function readFilesInFolder(folder) {
    let recipes = {};
    let tags = [];
    // let dirPath = path.join(__dirname, 'recipes', folder);
    fs.readdirSync(folder).forEach(fileName => {
        let filePath = path.join(folder, fileName);
        let stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            console.log('There should be no directory here!');
        } else if (stats.isFile()) {
            let key = path.parse(fileName).name;
            recipes[key] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            recipes[key].id = key;
            recipes[key].category = folder;
            recipes[key].image = addImages(key);
            recipes[key].tags.forEach(tag => {
                if (!tags.includes(tag)) {
                    tags.push(tag);
                }
            });
        }
    });
    return {recipes: recipes, tags: tags};
}

function addImages(key) {
    let images = [];
    let image1 = path.join(__dirname, 'public', 'images', `${key}.jpg`);
    let image2 = path.join(__dirname, 'public', 'images', `${key}-2.jpg`);
    if (fs.existsSync(image1)) {
        images.push(`${key}.jpg`);
    }
    if (fs.existsSync(image2)) {
        images.push(`${key}-2.jpg`);
    }
    return images;
}
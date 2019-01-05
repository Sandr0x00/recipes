/* global exports, require, __dirname, console */

let fs = require('fs');
let path = require('path');

exports.formatPreparation = function(recipe) {
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
};

exports.loadJSON = function() {
    let recipes = {};
    let categories = {};
    let dirPath = path.join(__dirname, 'recipes');
    fs.readdirSync(dirPath).forEach(dirname => {
        // set categories
        let category = {};
        let metaPath = path.join(dirPath, dirname, '_meta.json');
        category[dirname] = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        category[dirname].id = dirname;
        Object.assign(categories, category);

        // set recipes
        let filePath = path.join(dirPath, dirname);
        let stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            Object.assign(recipes, readFilesInFolder(dirname));
        } else if (stats.isFile()) {
            console.log('There should be no file here!');
        }
    });
    return {recipes: recipes, categories: categories};
};

function readFilesInFolder(folder) {
    let recipes = {};
    let dirPath = path.join(__dirname, 'recipes', folder);
    fs.readdirSync(dirPath).forEach(fileName => {
        if (fileName == '_meta.json') {
            return;
        }
        let filePath = path.join(dirPath, fileName);
        let stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            console.log('There should be no directory here!');
        } else if (stats.isFile()) {
            let key = path.parse(fileName).name;
            recipes[key] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            recipes[key].id = key;
            recipes[key].category = folder;
        }
    });
    return recipes;
}

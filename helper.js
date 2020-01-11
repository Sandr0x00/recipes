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
    let dirPath = path.join(__dirname, 'recipes');
    let stuff = readFilesInFolder(dirPath);
    linkIngredients(stuff.recipes);

    for (const key in stuff.recipes) {
        let recipe = stuff.recipes[key];
        let prep = this.formatPreparation(recipe);
        Object.assign(recipe, {
            preparation: prep[0],
            preparationAmounts: prep[1],
        });
    }

    return {recipes: stuff.recipes, tags: stuff.tags};
};

/**
 * Extracts id, type, name, images
 * @param {Object} recipes
 */
exports.extractGeneralInfo = (recipes) => {
    let info = {};
    for (const key in recipes) {
        info[key] = {
            id: recipes[key].id,
            name: recipes[key].name,
            type: recipes[key].type,
            images: recipes[key].images,
            tags: recipes[key].tags,
        };
    }
    return info;
};

function linkIngredients(recipes) {
    let ids = Object.keys(recipes);
    for (let key in recipes) {
        let recipe = recipes[key];
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
            recipes[key].images = addImages(key);
            recipes[key].tags.forEach(tag => {
                if (!tags.some(e => e.tag === tag)) {
                    tags.push({tag:tag, cnt:1});
                } else {
                    tags.find(e => e.tag === tag).cnt++;
                }
            });
        }
    });
    // sort based on occurence
    tags = tags.sort((a, b) => (a.cnt < b.cnt) ? 1 : -1);
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
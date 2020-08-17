/* global exports, require, __dirname */

let fs = require('fs');
let path = require('path');

function replace(regex, regexAmount, id, ingredient, preparation, preparationAmounts) {
    let replace;
    let replaceAmounts;
    if (!ingredient.name) {
        throw `Translation for ${id} missing.`;
    }
    let name = ingredient.name;
    if (preparation.match(regexAmount)) {
        let amount = preparation.match(regexAmount)[1];
        regex = `{${id}:${amount}}`;
        replace = `<b class='${id} ingredient'>${amount} ${name}</b>`;
        replaceAmounts = replace;
    } else {
        replace = `<b class='${id} ingredient'>${name}</b>`;
        replaceAmounts = `<b class='${id} ingredient'>${(ingredient.amount ? ingredient.amount + ' ' : '')} ${name}</b>`;
    }
    preparation = preparation.replace(new RegExp(regex, 'g'), replace);
    preparationAmounts = preparationAmounts.replace(new RegExp(regex, 'g'), replaceAmounts);
    return [
        preparation,
        preparationAmounts
    ];
}

const typeMapping = {
    'huricane': 'Hurricaneglas',
    'old-fashioned': 'Tumbler',
    'longdrink': 'Longdrinkglas',
};

exports.formatPreparation = function(recipe) {
    // replace preparations
    let type = typeMapping[recipe.type];
    if (type) {
        recipe.preparation.unshift(`Benötigte Utensilien: <i>${type}</i>`);
    }
    if (recipe.garnish) {
        recipe.preparation.push(`Deko: <i>${recipe.garnish}</i>`);
    }
    let preparation = JSON.stringify(recipe.preparation);
    let preparationAmounts = JSON.stringify(recipe.preparation);
    for (const [id, ingredient] of Object.entries(recipe.ingredients)) {
        while (preparation.match(`{${id}(:.+?)?}`)) {
            // first, replace ingredients with specific amounts, if there are any
            let regex = `{${id}}`;
            let regex_amount = `{${id}:(.+?)}`;
            let replaced = replace(regex, regex_amount, id, ingredient, preparation, preparationAmounts);
            preparation = replaced[0];
            preparationAmounts = replaced[1];
        }
    }
    preparation = preparation.replace('{all}', '<b class=\'all ingredient\'>Alles</b>');
    // preparation = preparation.replace('{all/}', '<b class=\'all ingredient\'>alles</b>');
    while (preparation.match(/{all\/(.*)}/)) {
        let allExcept = preparation.match(/{all\/(.*)}/);
        if (allExcept) {
            let except = allExcept[1];
            if (!recipe.ingredients[except]) {
                throw `Translation for ${except} missing`;
            }
            preparation = preparation.replace(new RegExp(`{all/(${except})}`, 'g'), `<b class='all ingredient'>Alles</b> außer <b class='${except} ingredient'>${recipe.ingredients[except].name}</b>`);
        }
    }

    return [
        JSON.parse(preparation),
        JSON.parse(preparationAmounts)
    ];
};

exports.loadJSON = function(format=true) {
    let dirPath = path.join(__dirname, 'recipes');
    let stuff = readFilesInFolder(dirPath);
    handleIngredients(stuff.recipes);

    for (const key in stuff.recipes) {
        let recipe = stuff.recipes[key];
        if (format) {
            let prep = this.formatPreparation(recipe);
            Object.assign(recipe, {
                preparation: prep[0],
                preparationAmounts: prep[1],
            });
        }
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
        if (recipes[key].headless) {
            continue;
        }
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

function handleIngredients(recipes) {
    let translationMapping = JSON.parse(fs.readFileSync('mapping.json', 'utf8'));
    for (let key in recipes) {
        translationMapping[key] = recipes[key].name;
    }

    let ids = Object.keys(recipes);
    let failure = false;
    for (let key in recipes) {
        let recipe = recipes[key];
        for (const [id, ingredient] of Object.entries(recipe.ingredients)) {
            // translate
            if (!('name' in ingredient) && id in translationMapping) {
                let trans = translationMapping[id];
                let singular = '';
                let plural = '';
                if (trans instanceof Array) {
                    singular = trans[0];
                    plural = trans[1];
                } else {
                    singular = trans;
                    plural = trans;
                }
                if ('amount' in ingredient) {
                    if (/\d\/\d.*/.test(ingredient.amount)) {
                        ingredient['name'] = singular;
                    } else if (/1/.test(ingredient.amount)) {
                        ingredient['name'] = singular;
                    } else if (/\+/.test(ingredient.amount)) {
                        delete ingredient.amount;
                        ingredient['name'] = plural;
                    } else {
                        ingredient['name'] = plural;
                    }
                } else {
                    ingredient['name'] = plural;
                }
            }

            // link
            if (ids.includes(id)) {
                let linkedRecipe = recipes[id];
                ingredient['link'] = '/' + linkedRecipe.id;
                if (!recipe['link']) {
                    recipe['link'] = [];
                }
                recipe['link'].push(linkedRecipe.id);
            }

            if (!('name' in ingredient)) {
                failure = true;
                console.log(`recipes/${key}.json: Ingredient ${id} not translated.`);
            }
        }
    }
    if (failure) {
        throw 'Some ingredients are not translated.';
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
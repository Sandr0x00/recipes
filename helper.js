/* global exports, require, __dirname */

let fs = require('fs');
let path = require('path');

function replace(id, ingredient, preparation, replaceAmounts=false) {
    let regex = `{${id}}`;
    let regex_amount = `{${id}:(.+?)}`;

    let replace;
    if (!ingredient.name) {
        throw `Translation for ${id} missing.`;
    }
    let name = ingredient.name;
    if (preparation.match(regex_amount)) {
        let amount = preparation.match(regex_amount)[1];
        regex = `{${id}:${amount}}`;
        replace = `<b class='${id} ingredient'>${amount} ${name}</b>`;
    } else {
        if (replaceAmounts) {
            replace = `<b class='${id} ingredient'>${(ingredient.amount ? ingredient.amount + ' ' : '')} ${name}</b>`;
        } else {
            replace = `<b class='${id} ingredient'>${name}</b>`;
        }
    }
    preparation = preparation.replace(new RegExp(regex, 'g'), replace);
    return preparation;
}

exports.formatPreparation = function(recipe, format_amounts=false) {
    // if (Array.isArray(recipe.preparation)) {
    //     recipe.preparation = [ 'Zubereitung': recipe.preparation ];
    // }
    let preparation = JSON.stringify(recipe.preparation);
    for (const [id, ingredient] of Object.entries(recipe.ingredients)) {
        while (preparation.match(`{${id}(:.+?)?}`)) {
            // first, replace ingredients with specific amounts, if there are any
            let replaced = replace(id, ingredient, preparation, format_amounts);
            preparation = replaced;
        }
    }
    preparation = preparation.replace('{all}', '<b class=\'all ingredient\'>Alles</b>');
    while (preparation.match(/{all\/([\w-]*)}/)) {
        let allExcept = preparation.match(/{all\/([\w-]*)}/);
        if (allExcept) {
            let except = allExcept[1];
            if (!recipe.ingredients[except]) {
                throw `${recipe.name} - Translation for ${except} missing`;
            }
            preparation = preparation.replace(new RegExp(`{all/(${except})}`, 'g'), `<b class='all ingredient'>Alles</b> außer <b class='${except} ingredient'>${recipe.ingredients[except].name}</b>`);
        }
    }

    return JSON.parse(preparation);
};

exports.loadJSON = function(format=true) {
    let dirPath = path.join(__dirname, 'recipes');
    let stuff = readFilesInFolder(dirPath);
    handleIngredients(stuff.recipes, stuff.tags);

    for (const key in stuff.recipes) {
        let recipe = stuff.recipes[key];
        if (format) {
            let prep = this.formatPreparation(recipe);
            Object.assign(recipe, {
                preparation: prep,
            });
        }
    }
    // sort based on occurence
    stuff.tags = stuff.tags.sort((a, b) => (a.cnt < b.cnt) ? 1 : -1);
    return {recipes: stuff.recipes, tags: stuff.tags};
};

/**
 * Extracts name, tags and an image
 * @param {Object} recipes
 */
exports.extractGeneralInfo = (recipes) => {
    let info = {};
    for (const [id, recipe] of Object.entries(recipes)) {
        if (recipes[id].headless) {
            continue;
        }
        let image = null;
        if (recipe.images.length > 0) {
            image = recipe.images[0];
        }
        info[id] = {
            name: recipes[id].name,
            image: image,
            tags: recipes[id].tags,
        };
    }
    return info;
};

function handleIngredients(recipes, tags) {
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

            // tag based on ingredient
            if (['couscous','kartoffel','ei','mozarella'].includes(id)) {
                let val = id;
                if (id == 'kartoffel') {
                    val = 'potato';
                } else if (id == 'mehl') {
                    val = 'flour';
                } else if (id == 'ei') {
                    val = 'egg';
                } else if (id == 'mozarella' || id == 'kaese' || id == 'camembert') {
                    val = 'cheese';
                }
                recipe.tags.push(val);
                if (!tags.some(e => e.tag === val)) {
                    tags.push({tag:val, cnt:1});
                } else {
                    tags.find(e => e.tag === val).cnt++;
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

const utensils = [
    'pan', 'longdrink', 'bbq', 'pot', 'wineglas', 'wok', 'old-fashioned', 'oven'
];

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
            let recipe;
            try {
                recipe = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            } catch (error) {
                console.log('Parsing of %s failed.', filePath);
                throw error;
            }
            recipes[key] = recipe;
            recipes[key].id = key;
            recipes[key].images = addImages(key);
            recipes[key].tags.forEach(tag => {
                if (!tags.some(e => e.tag === tag)) {
                    tags.push({tag:tag, cnt:1});
                } else {
                    tags.find(e => e.tag === tag).cnt++;
                }
            });

            // add utensils
            let first = true;
            let prep = null;
            let tagTranslations = require('./js/tags.js');
            for (let tag of recipes[key].tags) {
                if (utensils.includes(tag)) {
                    let r = tagTranslations[tag];
                    if (first) {
                        prep = `Benötigte Utensilien: <i>${r}</i>`;
                        first = false;
                    } else {
                        prep += `, <i>${r}</i>`;
                    }
                }
            }
            if (prep) {
                recipes[key]['utensils'] = prep;
            }
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
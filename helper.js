/* global exports, require, __dirname */

let fs = require('fs');
let path = require('path');

// let formatPreparation = require('./shared').formatPreparation;

exports.loadJSON = function(dirPath) {
    let stuff = readFilesInFolder(dirPath);
    handleIngredients(stuff.recipes, stuff.tags);

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
                ingredient['link'] = linkedRecipe.id;
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

const equipment = [
    'pan', 'longdrink', 'bbq', 'pot', 'wineglas', 'wok', 'old-fashioned', 'oven', 'blender'
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

            // add equipment
            let eq = [];
            for (let tag of recipes[key].tags) {
                if (equipment.includes(tag)) {
                    eq.push(tag);
                    // remove equipment from tags since it's displayed differently
                    recipes[key].tags.splice(recipes[key].tags.indexOf(tag), 1);
                }
            }
            recipes[key]['equipment'] = eq;
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
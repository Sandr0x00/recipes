/* global require, describe, it, __dirname */

/**
 * Tests if the recipes folder is valid.
 */

let fs = require('fs');
let path = require('path');
let assert = require('chai').assert;
let helper = require('../helper');
let formatPreparationStep = require('../shared').formatPreparationStep;

const images_path = path.join(__dirname, '..', 'public', 'images');
const recipesPath = path.join(__dirname, '../recipes');

describe('Recipe file names', function() {
    fs.readdirSync(recipesPath).forEach(dirName => {
        let dirPath = path.join(recipesPath, dirName);
        let stats = fs.statSync(dirPath);
        if (stats.isFile()) {
            return;
        }
        it(`files in recipes/${dirName}/ should not contain any special characters`, () => {
            fs.readdirSync(dirPath).forEach(fileName => {
                assert.match(fileName, /^([a-z-]+)\.json$/gm);
            });
        });
        it(`files in recipes/${dirName}/ should only contain files`, () => {
            fs.readdirSync(dirPath).forEach(fileName => {
                let filePath = path.join(dirPath, fileName);
                let stats = fs.statSync(filePath);
                assert.isTrue(stats.isFile(), `${filePath} should be a file.`);
            });
        });
    });
});

describe('Recipe file contents', () => {
    let validate = require('jsonschema').validate;
    let recipes = helper.loadJSON(recipesPath).recipes;
    let schema = JSON.parse(fs.readFileSync('recipes.schema.json', 'utf8'));
    for (const [key, recipe] of Object.entries(recipes)) {
        let result = validate(recipe, schema);
        let errorMsg = [];
        if (!result.valid) {
            for (const e in result.errors) {
                errorMsg.push(result.errors[e].property);
            }
        }
        it(`recipes/${key}.json - contents should be valid`, () => {
            assert.isTrue(result.valid, `[${errorMsg}] is not valid`);
        });
    }
});

describe('Recipe preparation format', () => {
    let recipes = helper.loadJSON(recipesPath).recipes;
    for (const [key, recipe] of Object.entries(recipes)) {
        it(`recipe/${key}.json - preparation should be valid`, () => {
            recipe.preparation.forEach(step => {
                step = formatPreparationStep(step, recipe.ingredients, false);
                assert.notMatch(step, /\{|\}/);
                assert.notMatch(step, /missing-translation/);
            });
        });
    }
});

describe('Recipe images', () => {
    let recipes = helper.loadJSON(recipesPath).recipes;
    for (const [key, recipe] of Object.entries(recipes)) {
        let images = recipe.images;
        it(`recipes/${key}.json - images in should exist`, () => {
            if (images) { // checked in 'Recipe file contents'
                if (images.length == 1) {
                    console.log(`    \x1B[33m${key} has only 1 image.\x1B[0m`);
                } else if (images.length == 0) {
                    console.log(`    \x1B[33m${key} has no images.\x1B[0m`);
                }
                images.forEach(image => {
                    assert(fs.existsSync(path.join(images_path, image)));
                });
            }
        });
    }
});

describe('Tag translation', () => {
    let translate = require('../js/tags.js');
    let json = helper.loadJSON(recipesPath);
    let recipes = json.recipes;
    let tags = json.tags;
    tags.forEach((tag) => {
        let t = tag.tag;
        let failed = [];
        if (!(t in translate)) {
            for (const [key, recipe] of Object.entries(recipes)) {
                if (recipe.tags && recipe.tags.includes(t)) {
                    failed.push(`recipes/${key}.json`);
                }
            }
        }
        it('tag ' + t + ' should be translated', () => {
            assert(t in translate, `tag used in ${failed}`);
        });
    });
});

describe('Unused ingredients', () => {
    let recipes = helper.loadJSON(recipesPath).recipes;
    for (const [key, recipe] of Object.entries(recipes)) {
        it(`recipes/${key}.json - should not have unused ingredients`, () => {
            let preparation = JSON.stringify(recipe.preparation);
            if (preparation.match(/{all}/)) {
                console.log('    \x1B[33m' + key + ' used {all} matcher.\x1B[0m');
                return;
            }
            if (preparation.match(/{all\/.*}/)) {
                console.log('    \x1B[33m' + key + ' used {all/except} matcher.\x1B[0m');
                return;
            }
            for (const id of Object.keys(recipe.ingredients)) {
                // first, replace ingredients with specific amounts, if there are any
                let regex = new RegExp(`{${id}(:.*)*}`, 'g');
                if (preparation.match(regex)) {
                    continue;
                }
                if (recipe.garnish && recipe.garnish.match(regex)) {
                    continue;
                }
                assert.ok(false, `"${id}" is unused.`);
            }
        });
    }
});

describe('Tag without icon', () => {
    let tags = helper.loadJSON(recipesPath).tags;
    tags.forEach((tag) => {
        let t = tag.tag;
        it(`icon for ${t} should exist`, () => {
            assert(fs.existsSync(`public/icons/${t}.svg`));
        });
    });
});

describe('Image without recipe', () => {
    let recipes = helper.loadJSON(recipesPath).recipes;

    const dir = fs.opendirSync(images_path);
    let images = new Set();
    let entry;
    while ((entry = dir.readSync()) !== null) {
        let m = /^(?:placeholder_)?(?<name>[a-zA-Z-]+)(?:[^-][^2])?.webp$/g.exec(entry.name);
        if (!m) {
            continue;
        }
        let name = m.groups['name'];
        if (!(name in recipes) && !images.has(name)) {
            images.add(name);
            it(`image ${name} should have a recipe`, () => {
                assert.fail(`images/${name}.webp`);
            });
        }
    }
    dir.closeSync();
});
/* global require, describe, it, __dirname */

/**
 * Tests if the recipes folder is valid.
 */

let fs = require('fs');
let path = require('path');
let assert = require('chai').assert;
let helper = require('../helper');
let formatPreparation = require('../shared').formatPreparation;

describe('Recipe file names', function() {
    let recipePath = path.join(__dirname, '../recipes');
    fs.readdirSync(recipePath).forEach(dirName => {
        let dirPath = path.join(recipePath, dirName);
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
    // let dirPath = path.join(__dirname, '../recipes');
    let recipes = helper.loadJSON().recipes;
    let schema = JSON.parse(fs.readFileSync('schema.json', 'utf8'));
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
    let recipes = helper.loadJSON().recipes;
    for (const [key, recipe] of Object.entries(recipes)) {
        it(`recipe/${key}.json - preparation should be valid`, () => {
            let prep = formatPreparation(recipe);
            prep.forEach(step => {
                assert.notMatch(step, /\{|\}/);
                assert.notMatch(step, /missing-translation/);
            });
        });
    }
});

describe('Recipe images', () => {
    let recipes = helper.loadJSON().recipes;
    let imagesPath = path.join(__dirname, '..', 'public', 'images');
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
                    assert(fs.existsSync(path.join(imagesPath, image)));
                });
            }
        });
    }
});

describe('Tag translation', () => {
    let translate = require('../js/tags.js');
    let tags = helper.loadJSON().tags;
    tags.forEach((tag) => {
        let t = tag.tag;
        it('tag ' + t + ' should be translated', () => {
            assert(t in translate);
        });
    });
});

describe('Unused ingredients', () => {
    let recipes = helper.loadJSON().recipes;
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
                let regex = `{${id}(:.*)*}`;
                assert.match(preparation, new RegExp(regex, 'g'), `"${id}" is unused.`);
            }
        });
    }
});

describe('Tag without icon', () => {
    let tags = helper.loadJSON().tags;
    tags.forEach((tag) => {
        let t = tag.tag;
        console.log(tag);
        it(`icon for ${t} should exist`, () => {
            assert(fs.existsSync(`public/icons/${t}.svg`));
        });
    });
});
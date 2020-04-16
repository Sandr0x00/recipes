/* global require, describe, it, __dirname */

/**
 * Tests if the recipes folder is valid.
 */

let fs = require('fs');
let path = require('path');
let assert = require('chai').assert;
let helper = require('../helper');

describe('Recipe file names', function() {
    let recipePath = path.join(__dirname, '../recipes');
    fs.readdirSync(recipePath).forEach(dirName => {
        let dirPath = path.join(recipePath, dirName);
        let stats = fs.statSync(dirPath);
        if (stats.isFile()) {
            return;
        }
        it('files in recipes/' + dirName + '/ should not contain any special characters', () => {
            fs.readdirSync(dirPath).forEach(fileName => {
                assert.match(fileName, /^([a-z-]+|_meta)\.json$/gm);
            });
        });
        it('files in recipes/' + dirName + '/ should only contain files', () => {
            fs.readdirSync(dirPath).forEach(fileName => {
                let filePath = path.join(dirPath, fileName);
                let stats = fs.statSync(filePath);
                assert.isTrue(stats.isFile(), filePath + ' should be a file.');
            });
        });
    });
});

describe('Recipe file contents', () => {
    let validate = require('jsonschema').validate;
    // let dirPath = path.join(__dirname, '../recipes');
    let recipes = helper.loadJSON().recipes;
    let schema = getSchema();
    for (const key in recipes) {
        let json = recipes[key];
        let result = validate(json, schema);
        if (!result.valid) {
            console.log(`./recipes/${key}.json`);
            console.log(result.errors);
        }
        assert(result.valid);
    }
});

function getSchema() {
    return JSON.parse(fs.readFileSync('schema.json', 'utf8'));
}

describe('Recipe preparation format', () => {
    let h = require('../helper.js');
    let recipes = h.loadJSON()['recipes'];
    for (let key in recipes) {
        let recipe = recipes[key];
        it(key + ' preparation should be valid', () => {
            let prep = h.formatPreparation(recipe)[0];
            prep.forEach(step => {
                assert.notMatch(step, /(\{|\})/);
            });
        });
    }
});

describe('Recipe images', () => {
    let h = require('../helper.js');
    let recipes = h.loadJSON()['recipes'];
    let imagesPath = path.join(__dirname, '..', 'public', 'images');
    for (let key in recipes) {
        let recipe = recipes[key];
        let images = recipe.images;
        it('images in ' + key + ' should exist', () => {
            if (images) { // checked in 'Recipe file contents'
                if (images.length == 1) {
                    console.log('    \x1B[33m' + key + ' has only 1 image.\x1B[0m');
                } else if (images.length == 0) {
                    console.log('    \x1B[33m' + key + ' has no images.\x1B[0m');
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
    let h = require('../helper.js');
    let tags = h.loadJSON()['tags'];

    tags.forEach((tag) => {
        let t = tag.tag;
        it('tag ' + t + ' should be translated', () => {
            assert(t in translate);
        });
    });
});

/* global require, describe, it, __dirname, console */

/**
 * Tests if the recipes folder is valid.
 */

let fs = require('fs');
let path = require('path');
let assert = require('chai').assert;

describe('Categoriy folder names', function() {
    let recipePath = path.join(__dirname, '../recipes');
    it('directories in recipes/ should not contain any special characters', () => {
        fs.readdirSync(recipePath).forEach(fileName => {
            assert.match(fileName, /^[a-z-]+$/gm);
        });
    });
    it('directories in recipes/ should only contain directories', () => {
        fs.readdirSync(recipePath).forEach(dirName => {
            let dirPath = path.join(recipePath, dirName);
            let stats = fs.statSync(dirPath);
            assert.isTrue(stats.isDirectory(), dirPath + ' is not a directory.');
        });
    });
});

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
    let recipePath = path.join(__dirname, '../recipes');
    fs.readdirSync(recipePath).forEach(dirName => {
        if (dirName == 'sandwich') {
            // TODO: Do not skip sandwiches.
            return;
        }
        let dirPath = path.join(recipePath, dirName);
        fs.readdirSync(dirPath).forEach(fileName => {
            if (fileName == '_meta.json') {
                return;
            }
            let filePath = path.join(dirPath, fileName);
            let stats = fs.statSync(filePath);
            if (stats.isFile()) {
                it('recipes/' + dirName + '/' + fileName + ' should be valid', () => {
                    let result = validate(JSON.parse(fs.readFileSync(filePath, 'utf8')), getSchema());
                    if (!result.valid) {
                        console.log(result.errors);
                    }
                    assert(result.valid);
                });
            }
        });
    });
});

function getSchema() {
    return {
        id: '/All',
        type: 'object',
        additionalProperties: false,
        properties: {
            name: {
                type: 'string',
                required: true,
                minLength: 3
            },
            portions: {
                type: 'string',
                pattern: /^[0-9].*/
            },
            ingredients: {
                type: 'array',
                required: true,
                uniqueItems: true,
                minItems: 1,
                items: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            pattern: /^[a-z]+$/,
                            required: true,
                            minLength: 2
                        },
                        amount: {
                            type: 'string',
                            pattern: /^[0-9]+(g|ml| TL| EL| Pkg.)?/
                        },
                        name: {
                            type: 'string',
                            required: true,
                            minLength: 2
                        },
                        optional: {
                            type: 'boolean'
                        }
                    }
                }
            },
            preparation: {
                type: 'array',
                required: true,
                uniqueItems: true,
                minItems: 1,
                items: {
                    type: 'string',
                    required: true,
                    minLength: 2
                }
            }
        }
    };
}

describe('Recipe preparation format', () => {
    let h = require('../helper.js');
    let recipes = h.loadJSON()['recipes'];
    for (let key in recipes) {
        let recipe = recipes[key];
        if (recipe.category != 'sandwich') {
            it(key + ' preparation should be valid', () => {
                let prep = h.formatPreparation(recipe)[0];
                prep.forEach(step => {
                    assert.notMatch(step, /(\{|\})/);
                });
            });
        }
    }
});

describe('Recipe images', () => {
    let h = require('../helper.js');
    let recipes = h.loadJSON()['recipes'];
    let imagesPath = path.join(__dirname, '..', 'public', 'images');
    for (let key in recipes) {
        let recipe = recipes[key];
        let images = recipe.image;
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

describe('Category meta data', () => {
    let validate = require('jsonschema').validate;
    let recipePath = path.join(__dirname, '../recipes');
    fs.readdirSync(recipePath).forEach(dirName => {
        it('recipes/' + dirName + '/_meta.json should exist and be valid', () => {
            let metaPath = path.join(recipePath, dirName, '_meta.json');
            if (fs.existsSync(metaPath)) {
                let result = validate(JSON.parse(fs.readFileSync(metaPath, 'utf8')), getMetaSchema());
                if (!result.valid) {
                    console.log(result.errors);
                }
                assert(result.valid);
            } else {
                assert.fail(metaPath + ' does not exist');
            }
        });
    });
});

function getMetaSchema() {
    return {
        id: '/All',
        type: 'object',
        properties: {
            name: {
                type: 'string',
                required: true
            },
            image: {
                type: 'string',
                required: false
            }
        }
    };
};
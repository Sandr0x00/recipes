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
    for (const key in recipes) {
        let json = recipes[key];
        let result = validate(json, getSchema());
        if (!result.valid) {
            console.log(key);
            console.log(result.errors);
        }
        assert(result.valid);
    }
});

function getSchema() {
    return {
        id: '/All',
        type: 'object',
        additionalProperties: false,
        properties: {
            id: {
                type: 'string',
                required: true,
                minLength: 3
            },
            name: {
                type: 'string',
                required: true,
                minLength: 3
            },
            headless: {
                type: 'boolean'
            },
            portions: {
                type: 'string',
                pattern: /^[0-9].*/
            },
            type: {
                type: 'string',
                pattern: /^(wok|wine|pan|pot|oven|bbq|hurricane|old-fashioned|longdrink)$/
            },
            images: {
                type: 'array',
                required: true,
                uniqueItems: true
            },
            tags: {
                type: 'array',
                required: true,
                uniqueItems: true,
                minItems: 1,
                items: {
                    type: 'string',
                    pattern: /^[a-z]+$/,
                    required: true,
                    minLength: 2
                }
            },
            ingredients: {
                type: 'array',
                required: true,
                uniqueItems: true,
                minItems: 1,
                items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                        id: {
                            type: 'string',
                            pattern: /^[a-z0-9-]+$/,
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
                        link: {
                            type: 'string'
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
            },
            preparationAmounts: {
                type: 'array',
                required: true,
                uniqueItems: true,
                minItems: 1,
                items: {
                    type: 'string',
                    required: true,
                    minLength: 2
                }
            },
            garnish: {
                type: 'string',
                required: false,
            },
            link: {
                type: 'array'
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

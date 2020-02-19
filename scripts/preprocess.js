#!/usr/bin/env node

/* global require */

const fs = require('fs');
let helper = require('../helper');

let json = helper.loadJSON();
let recipes = json.recipes;

let failed = 0;

for (const key in recipes) {
    let recipe = recipes[key];
    fs.writeFile(`public/recipes/${recipe.id}.json`, JSON.stringify(recipe), 'utf8', function (err) {
        if (err) {
            failed++;
            console.log('[\x1B[31m\u2717\x1b[0m] An error occured while writing JSON Object to File.');
            return console.log(err);
        }

        console.log(`[\x1B[32m\u2713\x1b[0m] Saved ${recipe.id}`);
    });
}

if (failed > 0) {
    console.log(`[\x1B[31m\u2717\x1b[0m] Failed: ${failed}`);
}
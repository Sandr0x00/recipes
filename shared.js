/* global exports */

// Stuff that is used in the server/test/preprocess part as well as in the client.

function replace(id, ingredient, preparation, format_amounts=false) {
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
        if (format_amounts) {
            replace = `<b class='${id} ingredient'>${(ingredient.amount ? ingredient.amount + ' ' : '')} ${name}</b>`;
        } else {
            replace = `<b class='${id} ingredient'>${name}</b>`;
        }
    }
    preparation = preparation.replace(new RegExp(regex, 'g'), replace);
    return preparation;
}

exports.formatPreparationStep = function(name, step, ingredients, compact=false) {
    // replace ingredients
    let regex = /{([\w-]+)(:.+?)?}/g;
    let matches = step.matchAll(regex);
    for (let match of matches) {
        let id = match[1];
        if (!(id in ingredients)) {
            continue;
        }
        step = replace(id, ingredients[id], step, compact);
    }
    // replace all-tags
    step = step.replace('{all}', '<b class=\'all ingredient\'>Alles</b>');
    while (step.match(/{all\/([\w-]*)}/)) {
        let allExcept = step.match(/{all\/([\w-]*)}/);
        if (allExcept) {
            let except = allExcept[1];
            if (!ingredients[except]) {
                throw `${name} - Translation for ${except} missing`;
            }
            step = step.replace(new RegExp(`{all/(${except})}`, 'g'), `<b class='all ingredient'>Alles</b> außer <b class='${except} ingredient'>${ingredients[except].name}</b>`);
        }
    }

    return step;
};

exports.formatPreparation = function(recipe, format_amounts=false) {
    // if (Array.isArray(recipe.preparation)) {
    //     recipe.preparation = [ 'Zubereitung': recipe.preparation ];
    // }
    // replace ingredients
    let preparation = JSON.stringify(recipe.preparation);
    for (const [id, ingredient] of Object.entries(recipe.ingredients)) {
        while (preparation.match(`{${id}(:.+?)?}`)) {
            let replaced = replace(id, ingredient, preparation, format_amounts);
            preparation = replaced;
        }
    }
    // replace all tags
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

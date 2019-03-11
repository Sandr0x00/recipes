/* global $, XMLHttpRequest, console */
/* export  */

function loadRecipe(id, parent) {
    let xhr = new XMLHttpRequest();
    console.log(id);
    xhr.open('get', '/api/' + id, true);
    xhr.responseType = 'json';
    xhr.onload = () => {
        let status = xhr.status;
        if (status == 200) {
            appendRecipe(xhr.response, parent);
        } else {
            console.log('Something went wrong: ' + xhr.statusText);
        }
    };
    xhr.send();
}

function appendRecipe(recipeJson, parent) {
    let preparation = recipeJson['preparationAmounts'];

    let prepDiv = $('<div/>', {
        // class: 'col-sm-12.col-md-8.shrink.animate'
    });
    prepDiv.append(`<h2>${recipeJson['name']}</h2>`);
    preparation.forEach((step) => {
        prepDiv.append(`<p>${step}</p>`);
    });
    $('#preparation').prepend(prepDiv);
    $('#preparation-amounts').prepend(prepDiv.clone());
}
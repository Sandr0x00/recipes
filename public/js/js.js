$('.ingredient').hover(
    function() {
      $(getSecondClass(this)).addClass('highlight');
    }, function() {
        $(getSecondClass(this)).removeClass('highlight');
    }
);

function getSecondClass(elem) {
    return '.' + $(elem).attr('class').split(' ')[1]
}

$('img').Lazy();
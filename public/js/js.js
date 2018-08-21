$('.ingredient').hover(
    function() {
      $(getSecondClass(this)).addClass('highlight');
    }, function() {
        $(getSecondClass(this)).removeClass('highlight');
    }
);

function getSecondClass(elem) {
    return '.' + $(elem).attr('class').split(' ')[0]
}

function isMD() {
    let xs = window.getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-xs');
    let sm = window.getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-sm');
    let md = window.getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-md');
    let lg = window.getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-lg');
    let xl = window.getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-xl');
    let is_xs = window.matchMedia('(min-width: '+xs+')').matches;
    let is_sm = window.matchMedia('(min-width: '+sm+')').matches;
    let is_md = window.matchMedia('(min-width: '+md+')').matches;
    let is_lg = window.matchMedia('(min-width: '+lg+')').matches;
    let is_xl = window.matchMedia('(min-width: '+xl+')').matches;
    if (is_xl) {
        return true;
    }
    if (is_lg) {
        return true;
    }
    if (is_md) {
        return true;
    }
    return false;
}

isMD();

function fadeOutIngredients() {
    if ($('#ingredients').hasClass('d-none')) {
        return;
    }
    if (isMD()) {
        setTimeout(() => {
            $('#ingredients').toggleClass('col-md-4 col-md-1 grow shrink');
            $('#preparation').toggleClass('col-md-8 col-md-11 grow shrink');
        }, 100);
        setTimeout(() => {
            $('#ingredients').addClass('d-none');
            $('#ingredients-vert').removeClass('d-none');
            $('#preparation').addClass('d-none');
            $('#preparation-amounts').removeClass('d-none');
        }, 1100);
    } else {
        $('#inglist').toggleClass('h-0 h-100');
        setTimeout(() => {
            if ($('#preparation').hasClass('d-none')) {
                $('#preparation-amounts').addClass('d-none');
                $('#preparation').removeClass('d-none');
            } else {
                $('#preparation').addClass('d-none');
                $('#preparation-amounts').removeClass('d-none');
            }
        }, 100);
    }
    setTimeout(() => {
        $('#preparation').addClass('d-none');
        $('#preparation-amounts').removeClass('d-none');
    }, 1200);
}

function fadeInIngredients() {
    if (!$('#ingredients').hasClass('d-none')) {
        return;
    }
    $('#preparation').removeClass('d-none');
    $('#preparation-amounts').addClass('d-none');
    if (isMD()) {
        $('#ingredients-vert').addClass('d-none');
        $('#ingredients').removeClass('d-none');
        setTimeout(() => {
            $('#ingredients').toggleClass('col-md-4 col-md-1 grow shrink');
            $('#preparation').toggleClass('col-md-8 col-md-11 grow shrink');
        }, 100);
    }
}

$('img').Lazy();
$('.lazy').Lazy();
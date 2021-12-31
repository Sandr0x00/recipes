import $ from 'jquery';

export function dark() {
    return 'dark';
}

export function light() {
    return 'light';
}

$(function () {
    handleCookie();
});

function handleCookie() {
    let cName = 'theme';
    let theme = getCookie(cName);
    if (theme !== '') {
        if ((theme === dark() && $('body').hasClass(light()))
        || (theme === light() && $('body').hasClass(dark()))) {
            $('body').toggleClass(light());
            $('body').toggleClass(dark());
        }
    } else {
        if ($('body').hasClass(light())) {
            setCookie(cName, light());
        } else {
            setCookie(cName, dark());
        }
    }
}

export function setCookie(cname, cvalue) {
    let d = new Date();
    d.setTime(d.getTime() + (7 * 24 * 60 * 60 * 1000));
    document.cookie = `${cname}=${cvalue};expires=${d.toUTCString()};path=/;SameSite=Strict`;
}

export function getCookie(cname) {
    let name = `${cname}=`;
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}

export function isAdmin() {
    return getCookie('admin') === 'true';
}

export function isDark() {
    return getCookie('theme') === dark();
}
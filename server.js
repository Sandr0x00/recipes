#!/usr/bin/env node

/* global require, __dirname */

const express = require('express');
const compression = require('compression');
const fs = require('fs');
const app = express();
const process = require('process');
const path = require('path');

let port = process.env.PORT;
if (port == null || port == '') {
    port = 8082;
}

let helper = require('./helper');

let json = helper.loadJSON(path.join(__dirname, 'public', 'recipes'));
let tags = json.tags;
let general = helper.extractGeneralInfo(json.recipes);
json = null;

app.locals.compileDebug = true;
app.locals.cache = false;

const DEV = process.env.DEV != null;
const router = express.Router();

app.use((DEV ? '/recipes' : '/'), express.static('public', {
    setHeaders: (res) => setHeaders(res)
}));
if (DEV) {
    app.use('/recipes', router);
}
app.use(compression());

(DEV ? router : app).get('/api/all', (req, res) => {
    setHeaders(res);
    res.json(general);
});

(DEV ? router : app).get('/api/tags', (req, res) => {
    setHeaders(res);
    res.json(tags);
});

(DEV ? router : app).get('/favicon.ico', (req, res) => {
    setHeaders(res);
    res.setHeader('Content-Type', 'image/png');
    let s = fs.createReadStream(`public/favicon_${Math.floor(Math.random() * 6)}.png`);
    s.pipe(res);
});

(DEV ? router : app).get('*', (req, res) => {
    // use nagivo routing => always serve index.html
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, '0.0.0.0', (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }
    console.log(`Server is listening on ${port}`);
});

function setHeaders(res) {
    res.setHeader('X-XSS-ProtectionType', '"1; mode=block"');
    res.setHeader('X-Frame-Options', 'deny');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Strict-Transport-Security', '"max-age=31536000; includeSubDomains; preload"');
    res.setHeader('Content-Security-Policy',
        'default-src \'none\';'
        + 'img-src \'self\';'
        + 'style-src \'self\' \'unsafe-inline\';'
        + 'script-src \'self\' \'unsafe-inline\';'
        + 'font-src \'self\';'
        + 'connect-src \'self\';'
        + 'frame-ancestors \'none\';');
    res.setHeader('X-Permitted-Cross-Domain-Policies', '"none"');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Feature-Policy', 'accelerometer \'none\'; camera \'none\'; geolocation \'none\'; gyroscope \'none\'; magnetometer \'none\'; microphone \'none\'; payment \'none\'; usb \'none\'; sync-xhr \'none\'');
}
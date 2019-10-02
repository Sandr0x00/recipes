#!/usr/bin/env python3

import os
import shutil

if __name__ == "__main__":
    folder = 'dist'
    if not os.path.isdir(folder):
        os.mkdir(folder)
    else:
        shutil.rmtree(folder)
        os.mkdir(folder)

    shutil.copy('helper.js', 'dist')
    shutil.copy('server.js', 'dist')
    shutil.copy('package.json', 'dist')
    shutil.copy('package-lock.json', 'dist')
    shutil.copytree('public', 'dist/public', ignore=shutil.ignore_patterns('.gitignore'))
    shutil.copytree('recipes', 'dist/recipes')

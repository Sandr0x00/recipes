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

    print("[ ] Copying files.", end="\r")

    shutil.copy('helper.js', 'dist')
    shutil.copy('Makefile', 'dist')
    shutil.copy('server.js', 'dist')
    shutil.copy('mapping.json', 'dist')
    shutil.copy('package.json', 'dist')
    shutil.copy('yarn.lock', 'dist')
    shutil.copy('.yarnrc.yml', 'dist')
    shutil.copytree('.yarn/releases', 'dist/.yarn/releases')
    shutil.copytree('.yarn/plugins', 'dist/.yarn/plugins')
    shutil.copytree('public', 'dist/public', ignore=shutil.ignore_patterns('.gitignore'))

    print("[\x1B[32m✓\x1b[0m] Copy files finished.")
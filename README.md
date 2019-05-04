[![Build Status](https://travis-ci.com/Sandr0x00/recipes.svg?branch=master)](https://travis-ci.com/Sandr0x00/recipes)

# What is this?
Just a small website based recipe collection for me.

# How does it look?
Check out the live version at [https://sandr0-recipes.herokuapp.com/](https://sandr0-recipes.herokuapp.com/)

# How can I use it?
Clone/fork this rep.

```bash
npm install
npm run build
npm start
```

Run `npm run zip` and copy `recipes.tar.gz` to your server and extract it there. Run `npm install` on your server.

# How can I add recipes?
Recipe
- Add &lt;name&gt;.json to a subfolder in recipes.
- It has to contain the following fields:
```json
{
    "name": "<The name of your recipe>",
    "portions": "<optional>", 
    "ingredients": [
        {
            "id": "<id, Used for preparation. If a recipe with that id exists, it will automatically get linked>", 
            "amount": "<optional>",
            "name": "<name which is displayed>"
        },
        {
        }
    ],
    "preparation": ["<first step>", "<second step>", "", ]
}
```
- It is possible to link ingredients in your preparation by using `{id}` or `{id:amount}` in preparation. Example: You have an ingredient with `"id": "salt"`. Now you can use `{salt}` in preparation.

# Contribution

Feel free to give me a PR (or write me at Twitter: [@Sandr0x00](https://twitter.com/Sandr0x00)), if you got a nice recipe. I always try new stuff. I kind of think,someday I will be a better cook than programmer.

Currently, all recipes are written in german, but maybe someday, I or another one will translate them. If you want to be this "other one", tell me :)

# Author
[Sandro Bauer](https://twitter.com/Sandr0x00)
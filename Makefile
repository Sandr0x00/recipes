.PHONY: build-css build-js build resize dist test recipes

setup:
	mkdir -p public/css
	mkdir -p public/icons
	mkdir -p public/images
	mkdir -p public/recipes

build-css:
	sass sass:public/css -s compressed

build-js:
	yarn rollup -c

resize:
	node scripts/resize.js

recipes:
	node scripts/preprocess.js

icons:
	./scripts/pixelparser.py

build: outdated clean setup icons build-css build-js resize recipes

outdated:
	yarn npm audit

lint:
	yarn eslint js

test:
	yarn mocha

dist: lint build test
	scripts/make_dist.py

serve:
	sass sass:public/css -s compressed --watch& node server.js

start:
	node server.js

kill:
	@kill $(ps -ef | grep "[n]ode server.js" | awk '{print $2}')
	@ps -ef | grep "[n]ode server.js"

nohup:
	@nohup node server.js 2>&1 &
	@printf ""
	@tail -n 1 nohup.out
	@printf "\n"
	@ps -ef | grep "[n]ode server.js"

status:
	ps -ef | grep "[n]ode server.js"

clean:
	rm -rf public/css
	rm -rf public/images
	rm -rf public/icons
	rm -rf public/recipes
	rm -f public/index.js*

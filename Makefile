install:
	npm install

start:
	npm run babel-node src/bin/gendiff.js

build:
	rm -rf dist
	npm run build

publish:
	rm -rf dist
	npm publish

test:
	npm test

lint:
	npm run eslint .
.PHONY: test coverage

install: node_modules

node_modules:
	npm install

test:
	eslint .
	istanbul cover ./node_modules/.bin/_mocha

coverage:
	open coverage/lcov-report/index.html

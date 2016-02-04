.PHONY: test

install:
	npm install

test:
	eslint .
	mocha

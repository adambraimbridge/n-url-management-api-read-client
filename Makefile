include n.Makefile

.PHONY: test coverage

test: verify unit-test

unit-test:
	mocha

coverage:
	istanbul cover ./node_modules/.bin/_mocha
	open coverage/lcov-report/index.html

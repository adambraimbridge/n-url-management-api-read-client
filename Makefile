include n.Makefile

.PHONY: test coverage

test: verify unit-test

unit-test:
	export URLMGMTAPI_AWS_ACCESS_KEY=URLMGMTAPI_AWS_ACCESS; \
	export URLMGMTAPI_AWS_SECRET_KEY=URLMGMTAPI_AWS_SECRET; \
	mocha

coverage:
	istanbul cover ./node_modules/.bin/_mocha
	open coverage/lcov-report/index.html

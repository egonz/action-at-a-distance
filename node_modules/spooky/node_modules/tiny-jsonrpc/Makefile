PWD = $(shell pwd)
TEST_REPORTER ?= dot
TEST_TIMEOUT ?= 2000
TEST_SLOW ?= 200
TEST_PORT ?= 8080
NODE_MODULES = $(PWD)/node_modules
RELEASE_DIR = $(PWD)/dist
TEST_DIR = $(PWD)/test
JS_FILES = $(shell find $(PWD)/lib -name "*.js" -type f)

all: $(RELEASE_DIR)/tiny-jsonrpc.js

test:
	@$(NODE_MODULES)/.bin/mocha \
			--timeout $(TEST_TIMEOUT) --slow $(TEST_SLOW) \
			-R $(TEST_REPORTER) $(TEST_ARGS)

test-browser: all
	@cd test ; ln -s $(NODE_MODULES) node_modules ; ln -s $(RELEASE_DIR) dist
	@$(NODE_MODULES)/.bin/http-server $(TEST_DIR) -p $(TEST_PORT) ; \
		rm test/node_modules test/dist

$(RELEASE_DIR)/tiny-jsonrpc.js: $(JS_FILES) $(PWD)/app.build.js
	@mkdir -p $(RELEASE_DIR)/build
	node $(NODE_MODULES)/.bin/r.js -o $(PWD)/app.build.js \
		dir=$(RELEASE_DIR)/build
	cp $(RELEASE_DIR)/build/tiny-jsonrpc.js $(RELEASE_DIR)/
	@rm -rf $(RELEASE_DIR)/build

.PHONY: test

APP_NAME := $(shell basename $$PWD)
VERSION = $(shell node -p 'require("./package.json").version')
TARBALL_NAME := $(APP_NAME)_$(VERSION).tbz
PACKAGE := target/$(TARBALL_NAME)
DOCKER_LABEL := $(APP_NAME):$(VERSION)

.PHONY: release run

clean:
	@rm -rf target/*

$(PACKAGE): clean
	# Copy the assets we're taring into the target folder
	@mkdir -p target/$(APP_NAME)
	@cp -R data server client node_modules package.json target/$(APP_NAME)

	# Remove devDependencies
	@cd target/$(APP_NAME) && npm prune --production

	# Re-add nested dependencies
	@cd target/$(APP_NAME) && npm install --production

	# Tar up the package
	@cd target && tar cjfv $(TARBALL_NAME) --exclude=.DS_Store $(APP_NAME)

	# Clean up
	@rm -rf target/$(APP_NAME)

release: $(PACKAGE)
	@bash deploy/build.sh $(PACKAGE) $(DOCKER_LABEL)

run:
	docker run -p 8080:8080 -it $(DOCKER_LABEL)
# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.4.0](https://github.com/purple-technology/serverless-seed-plugin/compare/v0.3.2...v0.4.0) (2022-01-31)


### ⚠ BREAKING CHANGES

* added emptyOnly option (#75)

### Features

* added emptyOnly option ([#75](https://github.com/purple-technology/serverless-seed-plugin/issues/75)) ([22ecfb3](https://github.com/purple-technology/serverless-seed-plugin/commit/22ecfb3e4bcb8e843f5588adfb478f69f2d99e44))

### [0.3.2](https://github.com/purple-technology/serverless-seed-plugin/compare/v0.3.1...v0.3.2) (2022-01-12)


### Bug Fixes

* **cognito:** fixed seed for accounts with lot of user pools ([#73](https://github.com/purple-technology/serverless-seed-plugin/issues/73)) ([1f20c6f](https://github.com/purple-technology/serverless-seed-plugin/commit/1f20c6f234af5217ab30692c65254342e44b7a71))
* **dynamodb:** use all primary keys ([#74](https://github.com/purple-technology/serverless-seed-plugin/issues/74)) ([aa6df2e](https://github.com/purple-technology/serverless-seed-plugin/commit/aa6df2e3fb6691ec00bb5704ba750e64ea65fe9f))

### [0.3.1](https://github.com/purple-technology/serverless-seed-plugin/compare/v0.3.0...v0.3.1) (2022-01-11)


### Bug Fixes

* **cognito:** fixed user pool id search for 60+ pools count ([2458321](https://github.com/purple-technology/serverless-seed-plugin/commit/245832162703f19db85e793deca93e57b244922a))

## [0.3.0](https://github.com/purple-technology/serverless-seed-plugin/compare/v0.1.0...v0.3.0) (2022-01-11)


### ⚠ BREAKING CHANGES

* node 14
* use standard-version as release standard

### Features

* **cognito:** support for groups ([8bbfa66](https://github.com/purple-technology/serverless-seed-plugin/commit/8bbfa66385719201084ef49d0cd7314d7701dadd))
* **dynamodb:** support for table cloning and Jest upgrade ([e1710ee](https://github.com/purple-technology/serverless-seed-plugin/commit/e1710ee3fcdf360ebf6cf94ce8a5ab42fc196d81))


### Bug Fixes

* **dynamodb:** fixed missing required region for default config ([e95098a](https://github.com/purple-technology/serverless-seed-plugin/commit/e95098a7e4ff6d0e1da49a0e0c65dcf6cebf9043))


* node 14 ([e0d08cb](https://github.com/purple-technology/serverless-seed-plugin/commit/e0d08cb659bf7c3fd67e8476b4dba90ddeae9539))
* use standard-version as release standard ([fe23c2f](https://github.com/purple-technology/serverless-seed-plugin/commit/fe23c2fa72342d0f6aedc31752b84ad5e61d4c38))

## 0.1.0 (2021-06-24)


### ⚠ BREAKING CHANGES

* **dynamodb:**  use logical id as identifier instead of table name

### Features

* added s3 and cognito support ([6dab244](https://github.com/purple-technology/serverless-seed-plugin/commit/6dab244c1d44eb45772604271e9b309f4af0f426))


### Bug Fixes

* code review ([e38b0f7](https://github.com/purple-technology/serverless-seed-plugin/commit/e38b0f7b9ba05e775c6f5ae7c04b807baa8ebaff))


* **dynamodb:**  use logical id as identifier instead of table name ([655b5fe](https://github.com/purple-technology/serverless-seed-plugin/commit/655b5fe459d776f2152683d7df74c30b000cb290))

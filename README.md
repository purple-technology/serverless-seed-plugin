# serverless-seed-plugin

WIP

[![CI Status Badge](https://circleci.com/gh/purple-technology/serverless-seed-plugin.svg?style=svg)](https://github.com/purple-technology/serverless-seed-plugin)

This plugin seeds the data for AWS resources.

## Install

```sh
$ npm install --save-dev @purple/serverless-seed-plugin
```

Add the plugin to your `serverless.yml` file

```yml
plugins:
  - '@purple/serverless-seed-plugin'
```

## Supported resources

- `AWS::DynamoDB::Table`
- `AWS::Cognito::UserPool`
- `AWS::S3::Bucket`

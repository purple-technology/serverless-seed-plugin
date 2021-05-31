# serverless-seed-plugin

This plugin is still in WIP and non-stable.

[![CI Status Badge](https://circleci.com/gh/purple-technology/serverless-seed-plugin.svg?style=svg)](https://github.com/purple-technology/serverless-seed-plugin)

This plugin seeds the data for AWS resources.

## Supported resources

- `AWS::DynamoDB::Table`
- `AWS::Cognito::UserPool` (not implemented yet)
- `AWS::S3::Bucket` (not implemented yet)

## Install

```sh
$ npm install --save-dev @purple/serverless-seed-plugin
```

Add the plugin to your `serverless.yml` file.

```yml
plugins:
  - '@purple/serverless-seed-plugin'
```

## Usage

Set up custom data in your `serverless.yml` file.

```yml
custom:
  seed:
    dynamodb:
      - table: TableName
        data:
          - id: 'abc1'
            name: 'myRecordName1'
          - id: 'abc2'
            name: 'myRecordName2'
```

Or you can follow the code in `./example/` dir.

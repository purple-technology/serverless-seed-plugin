# serverless-seed-plugin

This plugin is still in WIP and non-stable.

[![CI Status Badge](https://circleci.com/gh/purple-technology/serverless-seed-plugin.svg?style=svg)](https://github.com/purple-technology/serverless-seed-plugin)

This plugin seeds the data for AWS resources.

## Supported resources

- `AWS::DynamoDB::Table`
- `AWS::Cognito::UserPool`
- `AWS::S3::Bucket`

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
      TableId:
        - id: 'abc1'
          name: 'myRecordName1'
        - id: 'abc2'
          name: 'myRecordName2'
    cognito:
      TodosUserPool:
        - username: abc1
          password: passw1
          attributes: # 'custom:' prefix for custom attributes is required
            - Name: custom:mutableClientData
              Value: mutableClientData_val
            - Name: custom:immutableClientData # Set only first time, then skipped
              Value: immutableClientData_val
        - username: abc2
          password: passw2
          attributes: []
    s3: # Do not forget to clear all bojects from bucket, before 'serverless remove' called or use https://github.com/purple-technology/serverless-s3-remover
      TodosBucket:
        - ./somedir/ # All nested dirs and files will be uploaded
```

Or you can follow the code in `./example/` dir.

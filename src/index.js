'use strict'

const CognitoResource = require('./resources/cognito')
const DynamoDbResource = require('./resources/dynamodb')
const S3Resource = require('./resources/s3')
const BbPromise = require('bluebird')

const resources = {
	cognito: (options) => new CognitoResource(options),
	dynamodb: (options) => new DynamoDbResource(options),
	s3: (options) => new S3Resource(options)
}

class ServerlessSeedPlugin {
	constructor(serverless) {
		this.serverless = serverless

		const { configSchemaHandler } = this.serverless

		configSchemaHandler.defineCustomProperties.bind(configSchemaHandler)({
			type: 'object',
			properties: {
				seed: {
					type: 'object',
					properties: {
						dynamodb: {
							type: 'object'
						}
					}
				}
			}
		})

		this.commands = {
			seed: {
				usage:
					'Seed target AWS resource with file loads using configuration from serverless.yml',
				lifecycleEvents: ['start']
			}
		}

		this.hooks = {
			'before:seed:start': () => BbPromise.bind(this).then(this.deploy)
		}

		// bindings
		this.log = this.log.bind(this)
	}

	log(msg) {
		this.serverless.cli.consoleLog(msg)
	}

	async deploy() {
		const options = this.serverless.service.custom.seed
		if (!options) return this.log('Skipping seed, no options provided')

		this.log('Starting seed...')

		for (const [resourceName, resourceOptions] of Object.entries(options)) {
			const resource = resources[resourceName]
			if (!resource) {
				throw new Error(`Unsupported seed resource '${resourceName}'`)
			}
			await resource({
				serverless: this.serverless,
				options: resourceOptions,
				log: (msg) => {
					this.log(`${resourceName}: ${msg}`)
				}
			}).deploy()
		}
		this.log('Seed finished!')
	}
}

module.exports = ServerlessSeedPlugin

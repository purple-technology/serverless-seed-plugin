'use strict'

const DynamoDbStorage = require('./storages/dynamodb')
const BbPromise = require('bluebird')

const storages = {
	dynamodb: (options) => new DynamoDbStorage(options)
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
					'Seed target AWS storages with file loads using configuration from serverless.yml',
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
		if (!options) {
			return this.log('Skipping seed, no options provided')
		}

		this.log('Starting seed...')

		for (const [storageName, storageOptions] of Object.entries(options)) {
			const storage = storages[storageName]
			if (!storage) {
				throw new Error(`Unsupported seed storage ${storageName}`)
			}
			await storage({
				baseDir: this.serverless.config.servicePath,
				provider: this.serverless.getProvider('aws'),
				options: storageOptions,
				log: (msg) => {
					this.log(`${storageName}: ${msg}`)
				}
			}).deploy()
		}
		this.log('Seed finished!')
	}
}

module.exports = ServerlessSeedPlugin

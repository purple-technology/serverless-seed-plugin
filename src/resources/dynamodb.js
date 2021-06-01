'use strict'

class DynamoDbResource {
	constructor({ baseDir, provider, options, log, serverless }) {
		this.baseDir = baseDir
		this.provider = provider
		this.options = options
		this.log = log

		this.tables = {}
		for (const [resourceId, resource] of Object.entries(
			serverless.service.resources.Resources
		)) {
			if (resource.Type.toLowerCase() === 'aws::dynamodb::table')
				this.tables[resourceId] = resource.Properties.TableName
		}

		const credentials = {
			...provider.getCredentials(),
			region: provider.getRegion()
		}

		this.dynamodb = new provider.sdk.DynamoDB.DocumentClient({
			service: new provider.sdk.DynamoDB(credentials)
		})
	}

	async deploy() {
		for (const [tableId, data] of Object.entries(this.options)) {
			const tableName = this.tables[tableId]

			this.log(`Table '${tableName}' - writing ${data.length} items..`)

			let recordGroup = data.splice(0, 25)
			while (recordGroup.length > 0) {
				await this.dynamodb
					.batchWrite({
						RequestItems: {
							[tableName]: recordGroup.map((record) => ({
								PutRequest: {
									Item: record
								}
							}))
						}
					})
					.promise()
				recordGroup = data.splice(0, 25)
			}

			this.log(`Table '${tableName}' - finished!`)
		}
	}
}

module.exports = DynamoDbResource

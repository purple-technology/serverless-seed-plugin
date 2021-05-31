'use strict'

class DynamoDbResource {
	constructor({ baseDir, provider, options, log }) {
		this.baseDir = baseDir
		this.provider = provider
		this.options = options
		this.log = log

		const credentials = {
			...provider.getCredentials(),
			region: provider.getRegion()
		}

		this.dynamodb = new provider.sdk.DynamoDB.DocumentClient({
			service: new provider.sdk.DynamoDB(credentials)
		})
	}

	async deploy() {
		for (const { table, data } of this.options) {
			this.log(`Table '${table}' - writing ${data.length} items..`)
			let recordGroup = data.splice(0, 25)
			while (recordGroup.length > 0) {
				await this.dynamodb
					.batchWrite({
						RequestItems: {
							[table]: recordGroup.map((record) => ({
								PutRequest: {
									Item: record
								}
							}))
						}
					})
					.promise()
				recordGroup = data.splice(0, 25)
			}
			this.log(`Table '${table}' - finished!`)
		}
	}
}

module.exports = DynamoDbResource

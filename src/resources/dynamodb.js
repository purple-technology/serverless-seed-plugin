'use strict'

const { copy } = require('copy-dynamodb-table')

const DYNAMODB_BATCH_LIMIT = 25

const getPutRequest = (item) => ({
	PutRequest: {
		Item: item
	}
})

const getDeleteRequest = (item) => ({
	DeleteRequest: {
		Key: {
			id: item.id
		}
	}
})

class DynamoDbResource {
	constructor({ options, log, serverless }) {
		this.options = options
		this.log = log

		this.tables = {}
		for (const [resourceId, resource] of Object.entries(
			serverless.service.resources.Resources
		)) {
			if (resource.Type.toLowerCase() === 'aws::dynamodb::table')
				this.tables[resourceId] = resource.Properties.TableName
		}

		const provider = serverless.getProvider('aws')

		this.region = provider.getRegion()

		const credentials = {
			...provider.getCredentials(),
			region: this.region
		}

		const { DynamoDB } = provider.sdk

		this.dynamoDb = new DynamoDB(credentials)

		this.documentClient = new DynamoDB.DocumentClient({
			service: this.dynamoDb
		})
	}

	async deploy() {
		if (!this.options) return

		for (const [tableId, options] of Object.entries(this.options)) {
			const { data, clone, truncate } = options

			const tableName = this.tables[tableId]
			if (!tableName) {
				throw new Error(`Table name not found for table id ${tableId}`)
			}

			if (typeof data !== 'object' && !clone) {
				this.log(`Option data or clone is required for table ${tableName}`)
				continue
			}

			if (truncate && (!clone || !clone.recreate)) {
				this.log(`Table '${tableName}' - truncate table..`)
				const items = await this._getAllItems(tableName)
				await this._batchWrite(tableName, items, getDeleteRequest)
			}

			if (clone) {
				await this._clone(tableName, clone)
			}

			if (data) {
				this.log(`Table '${tableName}' - writing ${data.length} items..`)
				await this._batchWrite(tableName, data, getPutRequest)
			}

			this.log(`Table '${tableName}' - finished!`)
		}
	}

	async _clone(targetTable, options) {
		const { table, recreate, config } = options

		try {
			await this.dynamoDb
				.describeTable({
					TableName: table
				})
				.promise()
		} catch (err) {
			if (err.code === 'ResourceNotFoundException') {
				throw new Error(`Cloned table '${table}' not found`)
			}
			throw err
		}

		if (recreate) {
			this.log(`Table '${targetTable}' - delete table..`)
			try {
				await this.dynamoDb
					.describeTable({
						TableName: targetTable
					})
					.promise()
			} catch (err) {
				if (err.code !== 'ResourceNotFoundException') {
					throw err
				}
			}
		}

		this.log(`Table '${targetTable}' - clone from table ${table}..`)

		await this._cloneTable({
			config: {
				region: this.region
			},
			source: {
				tableName: table,
				config: config || {}
			},
			destination: {
				tableName: targetTable
			},
			create: recreate
		})
	}

	async _batchWrite(tableName, data, mapCb) {
		let recordGroup = data.splice(0, DYNAMODB_BATCH_LIMIT)
		while (recordGroup.length > 0) {
			await this.documentClient
				.batchWrite({
					RequestItems: {
						[tableName]: recordGroup.map((record) => mapCb(record))
					}
				})
				.promise()
			recordGroup = data.splice(0, DYNAMODB_BATCH_LIMIT)
		}
	}

	async _getAllItems(tableName, params = {}) {
		const scanResults = []

		let items
		do {
			items = await this.documentClient.scan({ TableName: tableName }).promise()
			items.Items.forEach((item) => scanResults.push(item))
			params.ExclusiveStartKey = items.LastEvaluatedKey
		} while (typeof items.LastEvaluatedKey !== 'undefined')

		return scanResults
	}

	_cloneTable(opt) {
		return new Promise((resolve, reject) => {
			copy(opt, function (err, result) {
				if (err) {
					return reject(err)
				}
				resolve(result)
			})
		})
	}
}

module.exports = DynamoDbResource

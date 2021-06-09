beforeEach(() => {
	jest.resetModules()
})

test('deploy with single item', async () => {
	const DynamoDbResource = require('../../src/resources/dynamodb')
	const { DocumentClient, args, record } = require('./../mocks/dynamodb')

	jest.spyOn(DocumentClient.prototype, 'batchWrite')

	args.options = {
		TableLogicalId: [record]
	}

	const resource = new DynamoDbResource(args)

	expect(await resource.deploy()).toBeUndefined()

	expect(args.log).toBeCalledTimes(2)
	expect(args.log).toHaveBeenNthCalledWith(
		1,
		"Table 'table_name' - writing 1 items.."
	)
	expect(args.log).toHaveBeenNthCalledWith(2, "Table 'table_name' - finished!")

	expect(DocumentClient.prototype.batchWrite).toHaveBeenCalledTimes(1)
	expect(DocumentClient.prototype.batchWrite).toHaveBeenNthCalledWith(1, {
		RequestItems: {
			table_name: [{ PutRequest: { Item: record } }]
		}
	})
})

test('deploy with multiple data', async () => {
	const DynamoDbResource = require('../../src/resources/dynamodb')
	const { DocumentClient, args, record } = require('./../mocks/dynamodb')

	jest.spyOn(DocumentClient.prototype, 'batchWrite')

	const count = 26
	const records = new Array(count).fill(record).map((item, index) => ({
		id: item.id + index,
		name: item.name + index
	}))

	args.options = {
		TableLogicalId: [...records]
	}

	const resource = new DynamoDbResource(args)

	expect(await resource.deploy()).toBeUndefined()

	expect(args.log).toBeCalledTimes(2)
	expect(args.log).toHaveBeenNthCalledWith(
		1,
		`Table 'table_name' - writing ${count} items..`
	)
	expect(args.log).toHaveBeenNthCalledWith(2, "Table 'table_name' - finished!")

	expect(DocumentClient.prototype.batchWrite).toHaveBeenCalledTimes(2)
	expect(DocumentClient.prototype.batchWrite).toHaveBeenNthCalledWith(1, {
		RequestItems: {
			table_name: records.slice(0, 25).map((item) => ({
				PutRequest: {
					Item: item
				}
			}))
		}
	})
	expect(DocumentClient.prototype.batchWrite).toHaveBeenNthCalledWith(2, {
		RequestItems: {
			table_name: records.slice(-1).map((item) => ({
				PutRequest: {
					Item: item
				}
			}))
		}
	})
})

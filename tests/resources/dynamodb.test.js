const DYNAMODB_BATCH_LIMIT = 25

const cloneRecords = (record, count) =>
	new Array(count).fill(record).map((item, index) => ({
		id: item.id + index,
		name: item.name + index,
		type: item.type + index
	}))

const DynamoDB = require('./../mocks/classes/DynamoDB')
const DocumentClient = require('./../mocks/classes/DocumentClient')

jest.mock('copy-dynamodb-table', () => ({
	copy: jest.fn((a, cb) => cb())
}))

describe('#dynamodb', () => {
	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should deploy write single item', async () => {
		const DynamoDbResource = require('../../src/resources/dynamodb')
		const { args, record } = require('./../mocks/dynamodb')

		const scanMock = jest
			.spyOn(DocumentClient.prototype, 'scan')
			.mockImplementation(() => ({
				promise: async () => ({
					Count: 0
				})
			}))

		const batchWriteMock = jest
			.spyOn(DocumentClient.prototype, 'batchWrite')
			.mockImplementation(() => ({
				promise: () => {}
			}))

		args.options = {
			TableLogicalId: {
				emptyOnly: true,
				data: [record]
			}
		}

		const resource = new DynamoDbResource(args)

		expect(await resource.deploy()).toBeUndefined()

		expect(args.log).toBeCalledTimes(2)
		expect(args.log).toHaveBeenNthCalledWith(
			1,
			"Table 'table_name' - writing 1 items.."
		)
		expect(args.log).toHaveBeenNthCalledWith(
			2,
			"Table 'table_name' - finished!"
		)

		expect(scanMock).toHaveBeenCalledWith({
			TableName: 'table_name',
			Select: 'COUNT'
		})

		expect(batchWriteMock).toHaveBeenCalledTimes(1)
		expect(batchWriteMock).toHaveBeenNthCalledWith(1, {
			RequestItems: {
				table_name: [{ PutRequest: { Item: record } }]
			}
		})
	})

	it('should skip seed when target is not empty', async () => {
		const DynamoDbResource = require('../../src/resources/dynamodb')
		const { args, record } = require('./../mocks/dynamodb')

		const scanMock = jest
			.spyOn(DocumentClient.prototype, 'scan')
			.mockImplementation(() => ({
				promise: async () => ({
					Count: 1
				})
			}))

		args.options = {
			TableLogicalId: {
				emptyOnly: true,
				data: [record]
			}
		}

		const resource = new DynamoDbResource(args)

		expect(await resource.deploy()).toBeUndefined()

		expect(args.log).toBeCalledTimes(1)
		expect(args.log).toHaveBeenCalledWith(
			"Table 'table_name' - skipped because it's not empty"
		)

		expect(scanMock).toHaveBeenCalledWith({
			TableName: 'table_name',
			Select: 'COUNT'
		})
	})

	it('should write multiple data', async () => {
		const DynamoDbResource = require('../../src/resources/dynamodb')
		const { args, record } = require('./../mocks/dynamodb')

		const batchWriteMock = jest
			.spyOn(DocumentClient.prototype, 'batchWrite')
			.mockImplementation(() => ({
				promise: () => {}
			}))

		const records = cloneRecords(record, DYNAMODB_BATCH_LIMIT + 1)

		args.options = {
			TableLogicalId: {
				data: [...records]
			}
		}

		const resource = new DynamoDbResource(args)

		expect(await resource.deploy()).toBeUndefined()

		expect(args.log).toBeCalledTimes(2)
		expect(args.log).toHaveBeenNthCalledWith(
			1,
			`Table 'table_name' - writing ${records.length} items..`
		)
		expect(args.log).toHaveBeenNthCalledWith(
			2,
			"Table 'table_name' - finished!"
		)

		expect(batchWriteMock).toHaveBeenCalledTimes(2)
		expect(batchWriteMock).toHaveBeenNthCalledWith(1, {
			RequestItems: {
				table_name: records.slice(0, DYNAMODB_BATCH_LIMIT).map((item) => ({
					PutRequest: {
						Item: item
					}
				}))
			}
		})
		expect(batchWriteMock).toHaveBeenNthCalledWith(2, {
			RequestItems: {
				table_name: records.slice(-1).map((item) => ({
					PutRequest: {
						Item: item
					}
				}))
			}
		})
	})

	it('should truncate table', async () => {
		const DynamoDbResource = require('../../src/resources/dynamodb')
		const { args, record } = require('./../mocks/dynamodb')

		const records = cloneRecords(record, DYNAMODB_BATCH_LIMIT + 1)

		const scanMock = jest
			.spyOn(DocumentClient.prototype, 'scan')
			.mockReturnValueOnce({
				promise: async () => ({ Items: records })
			})

		const batchWriteMock = jest
			.spyOn(DocumentClient.prototype, 'batchWrite')
			.mockImplementation(() => ({
				promise: () => {}
			}))

		args.options = {
			TableLogicalId: {
				data: [],
				truncate: true
			}
		}

		const resource = new DynamoDbResource(args)

		expect(await resource.deploy()).toBeUndefined()

		expect(args.log).toBeCalledTimes(3)
		expect(args.log).toHaveBeenNthCalledWith(
			1,
			"Table 'table_name' - truncate table.."
		)
		expect(args.log).toHaveBeenNthCalledWith(
			2,
			"Table 'table_name' - writing 0 items.."
		)
		expect(args.log).toHaveBeenNthCalledWith(
			3,
			"Table 'table_name' - finished!"
		)

		expect(scanMock).toHaveBeenCalledTimes(1)
		expect(scanMock).toHaveBeenCalledWith({
			TableName: 'table_name'
		})
		expect(batchWriteMock).toHaveBeenCalledTimes(2)
		expect(batchWriteMock).toHaveBeenNthCalledWith(1, {
			RequestItems: {
				table_name: records.slice(0, DYNAMODB_BATCH_LIMIT).map((item) => ({
					DeleteRequest: {
						Key: {
							id: item.id,
							type: item.type
						}
					}
				}))
			}
		})
		expect(batchWriteMock).toHaveBeenNthCalledWith(2, {
			RequestItems: {
				table_name: records.slice(-1).map((item) => ({
					DeleteRequest: {
						Key: {
							id: item.id,
							type: item.type
						}
					}
				}))
			}
		})
	})

	it('should throw error when cloned table not found', async () => {
		const error = new Error()
		error.code = 'ResourceNotFoundException'

		const describeTableMock = jest
			.spyOn(DynamoDB.prototype, 'describeTable')
			.mockImplementation(() => ({
				promise: () => {
					throw error
				}
			}))

		const DynamoDbResource = require('../../src/resources/dynamodb')
		const { args } = require('./../mocks/dynamodb')

		args.options = {
			TableLogicalId: {
				clone: {
					table: 'cloned_table_name'
				}
			}
		}

		const resource = new DynamoDbResource(args)
		await expect(resource.deploy()).rejects.toThrowError(
			`Cloned table 'cloned_table_name' not found`
		)
		expect(describeTableMock).toHaveBeenCalledTimes(1)
	})

	it('should clone table from different region', async () => {
		const DynamoDbResource = require('../../src/resources/dynamodb')
		const { args } = require('./../mocks/dynamodb')

		const describeTableMock = jest
			.spyOn(DynamoDB.prototype, 'describeTable')
			.mockImplementation(() => ({
				promise: () => {}
			}))

		args.options = {
			TableLogicalId: {
				data: [],
				clone: {
					table: 'source-clone-table-name',
					config: {
						region: 'ap-southeast-1'
					}
				}
			}
		}

		const { copy: copyMock } = require('copy-dynamodb-table')

		const resource = new DynamoDbResource(args)

		expect(await resource.deploy()).toBeUndefined()

		expect(copyMock).toBeCalledTimes(1)

		expect(args.log).toBeCalledTimes(3)
		expect(args.log).toHaveBeenNthCalledWith(
			1,
			"Table 'table_name' - clone from table source-clone-table-name.."
		)
		expect(args.log).toHaveBeenNthCalledWith(
			2,
			"Table 'table_name' - writing 0 items.."
		)
		expect(args.log).toHaveBeenNthCalledWith(
			3,
			"Table 'table_name' - finished!"
		)

		expect(describeTableMock).toHaveBeenCalledTimes(1)
	})
})

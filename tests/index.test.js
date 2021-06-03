beforeEach(() => {
	jest.resetModules()
})

test('no seed set', async () => {
	const ServerlessSeedPlugin = require('./../src/index')
	const { serverless } = require('./mocks')

	const plugin = new ServerlessSeedPlugin(serverless)

	expect(await plugin.deploy()).toBeUndefined()
})

test('resource dynamodb', async () => {
	jest.mock('./../src/resources/dynamodb')

	const { serverless } = require('./mocks')
	const ServerlessSeedPlugin = require('./../src/index')
	const DynamoDbResource = require('./../src/resources/dynamodb')

	serverless.service.custom.seed.dynamodb = null

	const DynamoDbResourceDeploy = jest.fn()
	DynamoDbResource.mockImplementation(() => ({
		deploy: DynamoDbResourceDeploy
	}))

	const plugin = new ServerlessSeedPlugin(serverless)
	jest.spyOn(plugin, 'log')

	expect(await plugin.deploy()).toBeUndefined()
	expect(DynamoDbResourceDeploy).toHaveBeenCalledTimes(1)

	expect(plugin.log).toHaveBeenCalledTimes(2)
	expect(plugin.log).toHaveBeenNthCalledWith(1, 'Starting seed...')
	expect(plugin.log).toHaveBeenNthCalledWith(2, 'Seed finished!')
})

test('unsupported resource', async () => {
	const { serverless } = require('./mocks')
	const ServerlessSeedPlugin = require('./../src/index')

	const resourceName = 'unsupported'
	serverless.service.custom.seed[resourceName] = null

	const plugin = new ServerlessSeedPlugin(serverless)

	jest.spyOn(plugin, 'log')

	await expect(plugin.deploy()).rejects.toThrow(
		`Unsupported seed resource '${resourceName}'`
	)

	expect(plugin.log).toHaveBeenCalledTimes(1)
	expect(plugin.log).toHaveBeenNthCalledWith(1, 'Starting seed...')
})

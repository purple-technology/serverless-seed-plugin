beforeEach(() => {
	jest.resetModules()
})

test('no seed set', async () => {
	const ServerlessSeedPlugin = require('./../src/index')
	const { serverless } = require('./mocks/common')

	const plugin = new ServerlessSeedPlugin(serverless)

	expect(await plugin.deploy()).toBeUndefined()
})

test('resource dynamodb', async () => {
	jest.mock('./../src/resources/dynamodb')

	const { serverless } = require('./mocks/common')
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

test('resource cognito', async () => {
	jest.mock('./../src/resources/cognito')

	const { serverless } = require('./mocks/common')
	const ServerlessSeedPlugin = require('./../src/index')
	const CognitoResource = require('./../src/resources/cognito')

	serverless.service.custom.seed.cognito = null

	const CognitoResourceDeploy = jest.fn()
	CognitoResource.mockImplementation(() => ({
		deploy: CognitoResourceDeploy
	}))

	const plugin = new ServerlessSeedPlugin(serverless)
	jest.spyOn(plugin, 'log')

	expect(await plugin.deploy()).toBeUndefined()
	expect(CognitoResourceDeploy).toHaveBeenCalledTimes(1)

	expect(plugin.log).toHaveBeenCalledTimes(2)
	expect(plugin.log).toHaveBeenNthCalledWith(1, 'Starting seed...')
	expect(plugin.log).toHaveBeenNthCalledWith(2, 'Seed finished!')
})

test('resource s3', async () => {
	jest.mock('./../src/resources/s3')

	const { serverless } = require('./mocks/common')
	const ServerlessSeedPlugin = require('./../src/index')
	const S3Resource = require('./../src/resources/s3')

	serverless.service.custom.seed.s3 = null

	const S3ResourceDeploy = jest.fn()
	S3Resource.mockImplementation(() => ({
		deploy: S3ResourceDeploy
	}))

	const plugin = new ServerlessSeedPlugin(serverless)
	jest.spyOn(plugin, 'log')

	expect(await plugin.deploy()).toBeUndefined()
	expect(S3ResourceDeploy).toHaveBeenCalledTimes(1)

	expect(plugin.log).toHaveBeenCalledTimes(2)
	expect(plugin.log).toHaveBeenNthCalledWith(1, 'Starting seed...')
	expect(plugin.log).toHaveBeenNthCalledWith(2, 'Seed finished!')
})

test('unsupported resource', async () => {
	const { serverless } = require('./mocks/common')
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

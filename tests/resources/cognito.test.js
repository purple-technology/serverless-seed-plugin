beforeEach(() => {
	jest.resetModules()
})

test('deploy with multiple users', async () => {
	const CognitoResource = require('../../src/resources/cognito')
	const {
		CognitoIdentityServiceProvider,
		args,
		users
	} = require('../mocks/cognito')

	jest
		.spyOn(CognitoIdentityServiceProvider.prototype, 'adminCreateUser')
		.mockImplementationOnce(() => ({
			promise: () => {}
		}))
		.mockImplementationOnce(() => {
			const err = new Error()
			err.code = 'UsernameExistsException'
			throw err
		})
	jest
		.spyOn(CognitoIdentityServiceProvider.prototype, 'listUserPools')
		.mockImplementationOnce(() => ({
			promise: async () => ({
				UserPools: [
					{
						Name: 'test_user_pool',
						Id: 'TestUserPoolId'
					}
				]
			})
		}))
	jest.spyOn(
		CognitoIdentityServiceProvider.prototype,
		'adminUpdateUserAttributes'
	)
	jest.spyOn(CognitoIdentityServiceProvider.prototype, 'adminSetUserPassword')

	args.options = {
		UserPooLogicalId: users
	}
	const resource = new CognitoResource(args)

	expect(await resource.deploy()).toBeUndefined()

	expect(args.log).toBeCalledTimes(2)
	expect(args.log).toHaveBeenNthCalledWith(
		1,
		"UserPool 'test_user_pool' - seeding 2 users.."
	)
	expect(args.log).toHaveBeenNthCalledWith(
		2,
		"UserPool 'test_user_pool' - 1 created, 1 updated!"
	)

	expect(
		CognitoIdentityServiceProvider.prototype.listUserPools
	).toHaveBeenCalledTimes(1)
	expect(
		CognitoIdentityServiceProvider.prototype.adminCreateUser
	).toHaveBeenCalledTimes(2)
	expect(
		CognitoIdentityServiceProvider.prototype.adminCreateUser
	).toHaveBeenNthCalledWith(1, {
		ForceAliasCreation: false,
		MessageAction: 'SUPPRESS',
		TemporaryPassword: users[0].password,
		UserAttributes: users[0].attributes,
		UserPoolId: 'TestUserPoolId',
		Username: users[0].username
	})
	expect(
		CognitoIdentityServiceProvider.prototype.adminCreateUser
	).toHaveBeenNthCalledWith(2, {
		ForceAliasCreation: false,
		MessageAction: 'SUPPRESS',
		TemporaryPassword: users[1].password,
		UserAttributes: users[1].attributes,
		UserPoolId: 'TestUserPoolId',
		Username: users[1].username
	})
	expect(
		CognitoIdentityServiceProvider.prototype.adminSetUserPassword
	).toHaveBeenCalledTimes(2)
	expect(
		CognitoIdentityServiceProvider.prototype.adminSetUserPassword
	).toHaveBeenNthCalledWith(1, {
		Password: users[0].password,
		Permanent: true,
		UserPoolId: 'TestUserPoolId',
		Username: users[0].username
	})
	expect(
		CognitoIdentityServiceProvider.prototype.adminSetUserPassword
	).toHaveBeenNthCalledWith(2, {
		Password: users[1].password,
		Permanent: true,
		UserPoolId: 'TestUserPoolId',
		Username: users[1].username
	})
	expect(
		CognitoIdentityServiceProvider.prototype.adminUpdateUserAttributes
	).toHaveBeenCalledTimes(1)
	expect(
		CognitoIdentityServiceProvider.prototype.adminUpdateUserAttributes
	).toHaveBeenNthCalledWith(1, {
		UserAttributes: users[1].attributes,
		UserPoolId: 'TestUserPoolId',
		Username: users[1].username
	})
})
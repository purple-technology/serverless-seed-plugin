class CognitoIdentityServiceProvider {
	adminCreateUser() {
		return {
			promise: async () => {}
		}
	}
	adminSetUserPassword() {
		return {
			promise: async () => {}
		}
	}
	adminUpdateUserAttributes() {
		return {
			promise: async () => {}
		}
	}
	adminAddUserToGroup() {
		return {
			promise: async () => {}
		}
	}
	listUserPools() {}
}

const awsProvider = {
	getCredentials: () => null,
	getRegion: () => null,
	sdk: {
		CognitoIdentityServiceProvider
	}
}

const args = {
	options: {},
	log: jest.fn(),
	serverless: {
		getProvider: () => awsProvider,
		service: {
			resources: {
				Resources: {
					UserPooLogicalId: {
						Type: 'AWS::Cognito::UserPool',
						Properties: {
							UserPoolName: 'test_user_pool',
							Schema: [
								{
									Name: 'mutableClientData',
									AttributeDataType: 'String',
									Mutable: true
								},
								{
									Name: 'immutableClientData',
									AttributeDataType: 'String',
									Mutable: false
								}
							]
						}
					}
				}
			}
		}
	}
}

module.exports = {
	CognitoIdentityServiceProvider,
	args,
	users: [
		{
			username: 'test_username',
			password: 'test_password',
			attributes: [
				{ Name: 'custom:immutableClientData', Value: 'immutableClientData_val' }
			],
			groups: ['test_group']
		},
		{
			username: 'test_username',
			password: 'test_password',
			attributes: [
				{ Name: 'custom:mutableClientData', Value: 'mutableClientData_val' }
			]
		}
	]
}

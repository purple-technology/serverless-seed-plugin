'use strict'

class CognitoResource {
	constructor({ options, log, serverless }) {
		this.options = options
		this.log = log
		const provider = serverless.getProvider('aws')
		this.resources = serverless.service.resources.Resources

		this.userPools = {}
		for (const [resourceId, resource] of Object.entries(this.resources)) {
			if (resource.Type.toLowerCase() === 'aws::cognito::userpool')
				this.userPools[resourceId] = resource.Properties.UserPoolName
		}

		const credentials = {
			...provider.getCredentials(),
			region: provider.getRegion()
		}

		this.identityProvider = new provider.sdk.CognitoIdentityServiceProvider({
			...credentials
		})
	}

	async deploy() {
		if (!this.options) return

		for (const [userPoolResourceId, users] of Object.entries(this.options)) {
			if (!users.length) continue

			const userPoolName = this.userPools[userPoolResourceId]
			const userPoolId = await this._findUserPoolIdByName(userPoolName)

			this.log(`UserPool '${userPoolName}' - seeding ${users.length} users..`)
			const stats = {
				created: 0,
				updated: 0
			}
			for (const { username, password, attributes, groups } of users) {
				try {
					await this.identityProvider
						.adminCreateUser({
							UserPoolId: userPoolId,
							Username: username,
							ForceAliasCreation: false,
							MessageAction: 'SUPPRESS',
							TemporaryPassword: password,
							UserAttributes: attributes || []
						})
						.promise()
					++stats.created
				} catch (createErr) {
					if (createErr.code === 'UsernameExistsException') {
						const attrToUpdate = (attributes || []).filter(
							(attr) =>
								!this._isAttributeImmutable(userPoolResourceId, attr.Name)
						)
						if (attrToUpdate.length > 0) {
							await this.identityProvider
								.adminUpdateUserAttributes({
									UserPoolId: userPoolId,
									Username: username,
									UserAttributes: attrToUpdate
								})
								.promise()
							++stats.updated
						}
					} else {
						throw createErr
					}
				}

				await this.identityProvider
					.adminSetUserPassword({
						Password: password,
						UserPoolId: userPoolId,
						Username: username,
						Permanent: true
					})
					.promise()

				for (const group of groups || []) {
					await this.identityProvider
						.adminAddUserToGroup({
							GroupName: group,
							UserPoolId: userPoolId,
							Username: username
						})
						.promise()
				}
			}

			this.log(
				`UserPool '${userPoolName}' - ${stats.created} created, ${stats.updated} updated!`
			)
		}
	}

	_isAttributeImmutable(resourceId, name) {
		return !this.resources[resourceId].Properties.Schema.find(
			(attr) =>
				(attr.Name == name || `custom:${attr.Name}` == name) && attr.Mutable
		)
	}

	async _findUserPoolIdByName(name, nextToken) {
		const params = {
			MaxResults: 60
		}

		const pools = []
		if (nextToken) params.NextToken = nextToken

		const result = await this.identityProvider.listUserPools(params).promise()
		pools.push(...result.UserPools.filter((pool) => pool.Name === name))

		if (result.NextToken)
			return await this._findUserPoolIdByName(name, result.NextToken)

		switch (pools.length) {
			case 0:
				return null
			case 1:
				return pools[0].Id
			default:
				throw new Error(`Found more than one pool named '${name}'`)
		}
	}
}

module.exports = CognitoResource

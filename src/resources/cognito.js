'use strict'

class CognitoResource {
	constructor({ options, log, serverless }) {
		this.options = options
		this.log = log
		this.provider = serverless.getProvider('aws')
		this.resources = serverless.service.resources.Resources

		this.userPools = {}
		for (const [resourceId, resource] of Object.entries(this.resources)) {
			if (resource.Type.toLowerCase() === 'aws::cognito::userpool')
				this.userPools[resourceId] = resource.Properties.UserPoolName
		}

		const credentials = {
			...this.provider.getCredentials(),
			region: this.provider.getRegion()
		}

		this.identityProvider =
			new this.provider.sdk.CognitoIdentityServiceProvider({
				...credentials
			})
	}

	async deploy() {
		if (!this.options) return

		for (const [logicalResourceId, options] of Object.entries(this.options)) {
			const { emptyOnly, data } = options

			if (!data.length) continue

			const userPoolName = this.userPools[logicalResourceId]
			const userPoolId = await this._findUserPoolId(logicalResourceId)

			if (emptyOnly) {
				const { Users: users } = await this.identityProvider
					.listUsers({
						UserPoolId: userPoolId,
						Limit: 1
					})
					.promise()
				if (users.length > 0) {
					this.log(
						`UserPool '${userPoolName}' - skipped because it's not empty`
					)
					continue
				}
			}

			this.log(`UserPool '${userPoolName}' - seeding ${data.length} users..`)
			const stats = {
				created: 0,
				updated: 0
			}
			for (const { username, password, attributes, groups } of data) {
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
								!this._isAttributeImmutable(logicalResourceId, attr.Name)
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

	_isAttributeImmutable(logicalResourceId, name) {
		return !this.resources[logicalResourceId].Properties.Schema.find(
			(attr) =>
				(attr.Name == name || `custom:${attr.Name}` == name) && attr.Mutable
		)
	}

	async _findUserPoolId(logicalResourceId) {
		const result = await this.provider.request(
			'CloudFormation',
			'describeStackResource',
			{
				LogicalResourceId: logicalResourceId,
				StackName: this.provider.naming.getStackName()
			}
		)
		return result.StackResourceDetail.PhysicalResourceId
	}
}

module.exports = CognitoResource

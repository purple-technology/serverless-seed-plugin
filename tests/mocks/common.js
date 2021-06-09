module.exports = {
	serverless: {
		configSchemaHandler: {
			defineCustomProperties: () => null
		},
		service: {
			custom: {
				seed: {}
			},
			resources: {
				Resources: {}
			}
		},
		cli: {
			consoleLog: jest.fn()
		},
		getProvider: jest.fn()
	}
}

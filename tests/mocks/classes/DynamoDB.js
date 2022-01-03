'use strict'

const DocumentClient = require('./DocumentClient')

module.exports = class DynamoDB {
	static get DocumentClient() {
		return DocumentClient
	}

	describeTable() {}
}

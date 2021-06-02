class DocumentClient {
	batchWrite() {
		return {
			promise: async () => {}
		}
	}
}

class DynamoDB {
	static get DocumentClient() {
		return DocumentClient
	}
}

const awsProvider = {
	getCredentials: () => null,
	getRegion: () => null,
	sdk: {
		DynamoDB
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
					TableLogicalId: {
						Type: 'AWS::DynamoDB::Table',
						Properties: {
							TableName: 'table_name'
						}
					}
				}
			}
		}
	}
}

module.exports = {
	DocumentClient,
	args,
	record: {
		id: 'abc',
		name: 'myRecordName'
	}
}

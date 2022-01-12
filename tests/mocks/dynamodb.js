const DynamoDB = require('./classes/DynamoDB')

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
							TableName: 'table_name',
							KeySchema: [
								{
									AttributeName: 'id',
									KeyType: 'HASH'
								},
								{
									AttributeName: 'type',
									KeyType: 'RANGE'
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
	args,
	record: {
		id: 'abc',
		name: 'myRecordName',
		type: 'myRecordType'
	}
}

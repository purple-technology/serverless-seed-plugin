class S3 {
	putObject() {
		return {
			promise: async () => {}
		}
	}
}

const awsProvider = {
	getCredentials: () => null,
	getRegion: () => null,
	sdk: {
		S3
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
					BucketLogicalId: {
						Type: 'AWS::S3::Bucket',
						Properties: {
							BucketName: 'bucket_name'
						}
					}
				}
			}
		}
	}
}

module.exports = {
	S3,
	args
}

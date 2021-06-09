beforeEach(() => {
	jest.resetModules()
})

test('deploy with nested dirs', async () => {
	const S3Resource = require('../../src/resources/s3')
	const { S3, args } = require('../mocks/s3')

	jest.spyOn(S3.prototype, 'putObject')

	args.options = {
		BucketLogicalId: ['./tests/fixtures/s3']
	}

	const resource = new S3Resource(args)

	expect(await resource.deploy()).toBeUndefined()

	expect(args.log).toBeCalledTimes(2)
	expect(args.log).toHaveBeenNthCalledWith(
		1,
		"Bucket 'bucket_name' - uploading 2 objects.."
	)
	expect(args.log).toHaveBeenNthCalledWith(
		2,
		"Bucket 'bucket_name' - finished!"
	)

	expect(S3.prototype.putObject).toHaveBeenCalledTimes(2)
	// expect(S3.prototype.putObject).toHaveBeenNthCalledWith(
	// 	1,
	// 	expect.objectContaining({
	// 		Key: 'test1',
	// 		Bucket: 'bucket_name',
	// 		Body: expect.anything()
	// 	})
	// )
	// expect(S3.prototype.putObject).toHaveBeenNthCalledWith(
	// 	2,
	// 	expect.objectContaining({
	// 		Key: 'test1',
	// 		Bucket: 'bucket_name',
	// 		Body: expect.anything()
	// 	})
	// )
})

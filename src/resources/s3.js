'use strict'

const { promises: fs, createReadStream } = require('fs')
const path = require('path')

class S3Resource {
	constructor({ options, log, serverless }) {
		this.options = options
		this.log = log

		this.buckets = {}
		for (const [resourceId, resource] of Object.entries(
			serverless.service.resources.Resources
		)) {
			if (resource.Type.toLowerCase() === 'aws::s3::bucket')
				this.buckets[resourceId] = resource.Properties.BucketName
		}

		const provider = serverless.getProvider('aws')
		const credentials = {
			...provider.getCredentials(),
			region: provider.getRegion()
		}

		this.provider = new provider.sdk.S3({
			...credentials
		})
	}

	async deploy() {
		if (!this.options) return
		for (const [bucketResourceId, options] of Object.entries(this.options)) {
			const { emptyOnly, data } = options

			if (!data.length) continue

			const bucketName = this.buckets[bucketResourceId]

			if (emptyOnly) {
				const { Versions: versions } = await this.provider
					.listObjectVersions({
						Bucket: bucketName
					})
					.promise()
				if (versions.length > 0) {
					this.log(`Bucket '${bucketName}' - skipped because it's not empty`)
					continue
				}
			}

			for (const dir of data) {
				const dirPath = path.resolve(process.cwd(), dir)
				const files = await this._getFiles(dirPath)
				this.log(`Bucket '${bucketName}' - uploading ${files.length} objects..`)

				for (const filePath of files) {
					await this.provider
						.putObject({
							Key: path.relative(dirPath, filePath),
							Bucket: bucketName,
							Body: createReadStream(filePath)
						})
						.promise()
				}
			}

			this.log(`Bucket '${bucketName}' - finished!`)
		}
	}

	async _getFiles(dir) {
		const dirents = await fs.readdir(dir, { withFileTypes: true })
		const files = await Promise.all(
			dirents.map((dirent) => {
				const res = path.resolve(dir, dirent.name)
				return dirent.isDirectory() ? this._getFiles(res) : res
			})
		)
		return Array.prototype.concat(...files)
	}
}

module.exports = S3Resource


const asyncHandler = require('../middleware/asyncHandle');
const MyError = require("../utils/myError")
const path = require('path')
const fs = require('fs')


exports.saveFIle = asyncHandler(async (file, folderName, addName) => {
	if (
		!file.mimetype.endsWith("application/octet-stream") &&
		!file.mimetype.endsWith("document") &&
		!file.mimetype.endsWith("msword") &&
		!file.mimetype.endsWith("pdf")
	) {
		throw new MyError("Та word эсвэл pdf file upload хийнэ үү", 400);
	}

	if (file.mimetype.endsWith("document") || file.mimetype.endsWith("msword")) {
		if (process.env.MAX_FILE_SIZE_WORD) {
			if (file.size > process.env.MAX_FILE_SIZE_WORD) {
				throw new MyError("Таны файлын хэмжээ их байна", 400);
			}
		}
	}

	if (file.mimetype.endsWith("pdf")) {
		if (process.env.MAX_FILE_SIZE_PDF) {
			if (file.size > process.env.MAX_FILE_SIZE_PDF) {
				throw new MyError("Таны файлын хэмжээ их байна", 400);
			}
		}
	}

	file.name = `file_${Date.now()}${path.parse(file.name).ext}`;
	if (addName) file.name = `file_${addName}_${Date.now()}${path.parse(file.name).ext}`;

	file.mv(`./public/${folderName}/${file.name}`, (err) => {
		if (err) {
			throw new MyError("Файлыг хуулах явцад алдаа гарлаа" + err.message, 400);
		}
	});
	return file.name;
})




exports.checkFile = asyncHandler(async (file, addName) => {

	if (
		!file.mimetype.endsWith("application/octet-stream") &&
		!file.mimetype.endsWith("document") &&
		!file.mimetype.endsWith("msword") &&
		!file.mimetype.endsWith("pdf")
	) {
		throw new MyError("Та word эсвэл pdf file upload хийнэ үү", 400);
	}

	if (file.mimetype.endsWith("document") || file.mimetype.endsWith("msword")) {
		if (process.env.MAX_FILE_SIZE_WORD) {
			if (file.size > process.env.MAX_FILE_SIZE_WORD) {
				throw new MyError("Таны файлын хэмжээ их байна", 400);
			}
		}
	}

	if (file.mimetype.endsWith("pdf")) {
		if (process.env.MAX_FILE_SIZE_PDF) {
			if (file.size > process.env.MAX_FILE_SIZE_PDF) {
				throw new MyError("Таны файлын хэмжээ их байна", 400);
			}
		}
	}

	file.name = `file_${Date.now()}${path.parse(file.name).ext}`;
	if (addName) file.name = `file_${addName}_${Date.now()}${path.parse(file.name).ext}`;

	return file;
})

exports.ensureDirectoryExistence = (filePath) => {
	let dirname = path.dirname(filePath);
	if (fs.existsSync(dirname)) {
		return true;
	}
	this.ensureDirectoryExistence(dirname);
	fs.mkdirSync(dirname);
}

exports.copy = () => {
	var readStream = fs.createReadStream(oldPath);
	var writeStream = fs.createWriteStream(newPath);

	readStream.on('error', callback);
	writeStream.on('error', callback);

	readStream.on('close', function () {
		fs.unlink(oldPath, callback);
	});

	readStream.pipe(writeStream);
}
import { hashString } from '../lib/hash.js';

/**
 * Remember to escape special characters when execute the script, like ; ' " ` ! &
 */
async function generatePw() {
	const inputString = process.argv.slice(2)[0];
	if (!inputString) {
		throw new Error('Input string not found')
	}
	const hashedString = await hashString(inputString, parseInt(process.env.SALT_ROUNDS))
	return {
		string: inputString,
		hash: hashedString
	}
}

generatePw()
	.then(res => {
		console.log(`Hashed "${res.string}": ${res.hash}`)
	}).catch(err => {
		console.error(err)
	})
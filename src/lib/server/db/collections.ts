import { getDB } from './mongo';

const db = getDB();
export async function getCollection(
	collection_name: string,
	skip: number,
	limit: number
): Promise<JSON> {
	// get repositories from MongoDB with skip and limit
	const data = await db
		.collection(collection_name)
		.find({})
		.project({ _id: 0 })
		.skip(skip)
		.limit(limit)
		.toArray();

	// return JSON response
	return data;
}
export async function searchCollection(collection_name: string, search: string): Promise<JSON> {
	// get repositories from MongoDB with search query and regex options
	const data = await db
		.collection(collection_name)
		.find({ title: { $regex: search, $options: 'i' } })
		.project({ _id: 0 })
		.toArray();

	// return JSON response
	return data;
}

export async function addToCollection(collection_name: string, doc: object): Promise<JSON> {
	console.log(collection_name, doc);

	const collection = db.collection(collection_name);
	const result = await collection.insertOne(doc);
	return result;
}

export async function uniqueIndex(collection_name: string, elems: object): Promise<JSON> {
	const result = await db.collection(collection_name).createIndex(elems, { unique: true });
	return result;
}

import { getCollection } from '$lib/server/db/collections';
import { getDB } from '$lib/server/db/mongo';

const db = getDB();
const classes = db.collection('classes');
export async function load() {
	let data = await classes.find({}).project({ _id: 0 }).toArray();
	return {
		classes: data
	};
}

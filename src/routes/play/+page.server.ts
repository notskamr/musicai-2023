import { getCollection } from '$lib/server/db/collections';
import { getDB } from '$lib/server/db/mongo';
import { redirect } from '@sveltejs/kit';

const db = getDB();
const classes = db.collection('classes');

export async function load() {
	let data = await getCollection('classes', 0, 0);
	return {
		classes: data
	};
}

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const grade = data.get('grade');
		const section = data.get('section');
		const score = Number(data.get('score'));

		let res = await classes
			.updateOne(
				{ grade: grade, section: section },
				{
					$push: {
						scores: score
					}
				}
			)
			.then(() => {
				throw redirect(301, '/leaderboard');
			});
	}
};

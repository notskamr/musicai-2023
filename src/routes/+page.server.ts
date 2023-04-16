import { addToCollection, uniqueIndex } from '$lib/server/db/collections';
import type { Actions } from './$types';

let grades = ['6', '7', '8', '9', '10', '11', '12', 'IB1', 'IB2'];
let sections = ['A', 'B', 'C', 'D', 'E', 'F', 'S', 'S1', 'H', 'H1'];
export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const grade = data.get('chooseGrade')?.toString().toUpperCase();
		const section = data.get('chooseSection')?.toString().toUpperCase();
		console.log(grade, section);

		if (!grade || !section) return { success: false };

		const inGrades = grades.includes(grade);
		const inSection = sections.includes(section);

		if (!inGrades || !inSection) return { success: false };

		try {
			const result = await addToCollection('classes', {
				grade,
				section: section,
				scores: []
			});
			console.log(result);
			return { success: true };
		} catch (err) {
			console.log(err);
			return { success: false };
		}
	}
};

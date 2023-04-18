<script lang="ts">
	import { onMount } from 'svelte';
	export let data;
	let parsedStorage: any;

	$: filteredClasses = [];
	$: position = NaN;
	let thisClass: any;

	interface Class {
		_id: string;
		grade: string;
		section: string;
		scores: number[];
	}
	interface FilteredClass {
		_id: string;
		grade: string;
		section: string;
		scores: number[];
		score: number;
	}
	$: filteredClasses = <FilteredClass[]>[];
	onMount(async () => {
		if (!localStorage.getItem('class')) window.location.pathname = '/';
		parsedStorage = JSON.parse(localStorage.class);
		let classes: Class[] = data.classes;
		thisClass = classes.filter((obj: Class) => {
			return obj.grade === parsedStorage.grade && obj.section === parsedStorage.section;
		})[0];

		console.log(classes);
		let ith = thisClass.scores.length - 1;
		for (let i = 0; i < classes.length; i++) {
			if (classes[i].scores[ith] || classes[i].scores[ith] == 0) {
				let filteredClass: FilteredClass;
				let scores = classes[i].scores.slice(0, ith + 1);
				let score = scores[ith];

				// @ts-expect-error
				filteredClass = classes[i];
				filteredClass.scores = scores;
				filteredClass.score = score;

				filteredClasses.push(filteredClass);
			}
		}

		filteredClasses.sort((a: Class, b: Class) => {
			return b.scores[ith] - a.scores[ith];
		});
		filteredClasses.forEach((a, i) => {
			if (a['grade'] === thisClass.grade && a['section'] === thisClass.section) {
				position = i + 1;
				return;
			}
		});
		filteredClasses = filteredClasses;
		console.log(filteredClasses);
		const grade = parsedStorage.grade;
		const section = parsedStorage.section;

		console.log(grade, section);
	});
	function nth(n: number) {
		return ['st', 'nd', 'rd'][((((n + 90) % 100) - 10) % 10) - 1] || 'th';
	}
</script>

<div class="w-screen h-screen flex justify-center p-8 items-center flex-col">
	<div class="text-5xl mb-2 text-green-500">Thanks for playing!</div>
	<div
		class="mb-8 text-2xl {position <= 3
			? 'text-yellow-400'
			: position <= 5
			? 'text-orange-500'
			: 'text-red-500'}"
	>
		You came {position ? `${position}${nth(position)}` : '___'}{position <= 3 ? '!' : '.'}
	</div>
	<table class="w-[70%] table-auto border-collapse border border-slate-500 text-center mb-12">
		<tr class="text-2xl">
			<th class="border border-slate-600">Grade</th>
			<th class="border border-slate-600">Section</th>
			<th class="border border-slate-600">Score</th>
		</tr>
		{#each filteredClasses as class_}
			{#if class_['grade'] === thisClass['grade']}
				<tr class="font-light text-yellow-400 text-xl">
					<td class="border border-slate-700">{class_['grade']}</td>
					<td class="border border-slate-700">{class_['section']}</td>
					<td class="border border-slate-700">{class_['score']}</td>
				</tr>
			{:else}
				<tr class="font-light text-xl">
					<td class="border border-slate-700">{class_['grade']}</td>
					<td class="border border-slate-700">{class_['section']}</td>
					<td class="border border-slate-700">{class_['score']}</td>
				</tr>
			{/if}
		{/each}
	</table>
</div>

<style>
	th {
		padding: 1rem;
	}
	td {
		padding: 0.7rem;
	}
</style>

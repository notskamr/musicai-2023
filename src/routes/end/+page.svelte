<script lang="ts">
	import { onMount } from 'svelte';
	export let data;
	let parsedStorage: any;

	$: filteredClasses = [];
	let thisClass: any;
	onMount(async () => {
		if (!localStorage.getItem('class')) window.location.pathname = '/';
		parsedStorage = JSON.parse(localStorage.class);

		thisClass = data.classes.filter((obj: object) => {
			// @ts-ignore
			return obj.grade === parsedStorage.grade && obj.section === parsedStorage.section;
		})[0];

		console.log(data.classes);
		let ith = thisClass.scores.length - 1;
		for (let i = 0; i < data.classes.length; i++) {
			if (data.classes[i].scores[ith] || data.classes[i].scores[ith] === 0) {
				let scores = data.classes[i].scores.slice(0, ith + 1);
				data.classes[i].scores = scores;
				data.classes[i].score = scores[ith];
				// @ts-ignore
				filteredClasses.push(data['classes'][i]);
			}
		}

		filteredClasses.sort((a: any, b: any) => {
			return b.scores[ith] - a.scores[ith];
		});
		filteredClasses = filteredClasses;
		console.log(filteredClasses);
		const grade = parsedStorage.grade;
		const section = parsedStorage.section;

		console.log(grade, section);
	});
</script>

<div class="w-screen h-screen flex justify-center p-8 items-center flex-col">
	<div class="text-5xl mb-12 text-green-500">Thanks for playing!</div>
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

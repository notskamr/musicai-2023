<script lang="ts">
	import { beforeUpdate, onMount, tick } from 'svelte';
	export let data;
	let parsedStorage: any;
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
	let thisClass: Class;
	$: selfRow = <any>undefined;

	beforeUpdate(async () => {
		await tick();
		selfRow.scrollIntoView({ behavior: 'smooth' });
	});
	onMount(async () => {
		if (!localStorage.getItem('class')) window.location.pathname = '/';
		parsedStorage = JSON.parse(localStorage.class);

		thisClass = data.classes.filter((obj: Class) => {
			return obj.grade === parsedStorage.grade && obj.section === parsedStorage.section;
		})[0];
		console.log(thisClass);
		console.log(data.classes);
		let ith = thisClass.scores.length - 1;
		for (let i = 0; i < data.classes.length; i++) {
			if (data.classes[i].scores[ith] || data.classes[i].scores[ith] === 0) {
				let scores = data.classes[i].scores.slice(0, ith + 1);
				data.classes[i].scores = scores;
				data.classes[i].score = scores[ith];
				filteredClasses.push(data['classes'][i]);
			}
		}

		filteredClasses.sort((a: FilteredClass, b: FilteredClass) => {
			let nameA = a.grade + a.section;
			let nameB = b.grade + b.section;

			if (nameA < nameB) return -1;
			if (nameA > nameB) return 1;
			return 0;
		});
		filteredClasses.sort((a: FilteredClass, b: FilteredClass) => {
			return b.scores[ith] - a.scores[ith];
		});
		filteredClasses = filteredClasses;
		console.log(filteredClasses);
		const grade = parsedStorage.grade;
		const section = parsedStorage.section;

		console.log(grade, section);
	});
</script>

<div class="w-screen h-screen flex justify-start overflow-y-scroll p-8 items-center flex-col">
	<div class="text-4xl mb-4">Leaderboard</div>
	<table class="w-[70%] table-auto border-collapse border border-slate-500 text-center mb-12">
		<tr class="text-2xl">
			<th class="border border-slate-600">Grade</th>
			<th class="border border-slate-600">Section</th>
			<th class="border border-slate-600">Score</th>
		</tr>
		{#each filteredClasses as class_}
			{#if class_ == thisClass}
				<tr class="font-light text-yellow-400 text-xl" id="selfRow" bind:this={selfRow}>
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
	<button
		class="text-2xl text-black bg-amber-400 px-4 py-2 rounded-lg hover:saturate-150 active:brightness-50"
		on:click={() => window.location.replace('/play')}>Proceed</button
	>
</div>

<style>
	th {
		padding: 1rem;
	}
	td {
		padding: 0.7rem;
	}
</style>

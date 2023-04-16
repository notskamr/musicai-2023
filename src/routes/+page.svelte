<script lang="ts">
	import { enhance } from '$app/forms';
	import { redirect } from '@sveltejs/kit';
	import { onMount } from 'svelte';
	let grade: string;
	let section: string;

	onMount(() => {
		if (localStorage.getItem('class')) window.location.pathname = '/play';
	});

	let grades = ['6', '7', '8', '9', '10', '11', '12', 'IB1', 'IB2'];
	let sections = ['A', 'B', 'C', 'D', 'E', 'F', 'S', 'S1', 'H', 'H1'];

	$: text = 'Get Started!';
</script>

<div class="flex flex-col items-center justify-center w-screen h-screen text-center">
	<div class="mb-3 text-4xl font-semibold text-orange-400 wave">
		Welcome to <span class="font-bold">MusicAI</span>!
	</div>
	<div class="mb-8 text-2xl text-blue-300">
		An AI powered quiz where classes collectively compete to distinguish real songs from
		AI-generated ones.
	</div>
	<form
		method="post"
		use:enhance={({ form, data, action, cancel }) => {
			text = 'Adding class to database...';
			// `form` is the `<form>` element
			// `data` is its `FormData` object
			// `action` is the URL to which the form is posted
			// `cancel()` will prevent the submission
			// `submitter` is the `HTMLElement` that caused the form to be submitted

			return async ({ result, update }) => {
				if (Object(result).data.success === false) {
					alert(
						'Did not succeed in creating class; probably already exists or an invalid entry was done.'
					);
					text = 'Get Started Again';
					grade = '';
					section = '';
				} else {
					localStorage.setItem(
						'class',
						JSON.stringify({ grade: grade.toUpperCase(), section: section.toUpperCase() })
					);
					text = 'Success!';
					window.location.pathname = '/play';
				}
				// `result` is an `ActionResult` object
				// `update` is a function which triggers the logic that would be triggered if this callback wasn't set
			};
		}}
	>
		<div class="mb-6 text-2xl text-slate-800">
			<input
				placeholder="Grade"
				list="grades"
				id="chooseGrade"
				name="chooseGrade"
				class="bg-gray-800 rounded-sm text-white mb-5 text-center py-2"
				required
				bind:value={grade}
			/>
			<datalist id="grades">
				{#each grades as grade}
					<option value={grade} />
				{/each}
			</datalist>
			<input
				placeholder="Section"
				list="sections"
				id="chooseSection"
				name="chooseSection"
				class="py-2 text-center text-white bg-gray-800 rounded-sm"
				required
				bind:value={section}
			/>
			<datalist id="sections">
				{#each sections as section}
					<option value={section} />
				{/each}</datalist
			>
		</div>
		<button
			class="p-3 text-3xl transition duration-150 bg-blue-800 rounded-md active:brightness-90 hover:saturate-150"
		>
			{text}
		</button>
	</form>
</div>

<style>
</style>

<script>
	import { onMount } from 'svelte';

	onMount(() => {
		localStorage.clear();
		window.location.pathname = '/';
	});
</script>

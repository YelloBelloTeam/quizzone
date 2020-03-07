<script>
	import Parosito from './qtypes/parosito.svelte';
	import Felelet from './qtypes/felelet.svelte';
	import { count } from './stores.js';
	/*
	svelte-loadable
	https://www.npmjs.com/package/svelte-loadable
	*/

	const components = [
		{ name: 'Párosító', qtype: Parosito, idx: 1 },
		{ name: 'Feleletválasztó', qtype: Felelet, idx: 2 },
	];

	let selected = components[0];

	let idx;
</script>

<header>
	<h1>Quizzone experiment!</h1>
	<p>Nem vagyunk "bezárva" egy képernyőbe, mint a projektoron! <br>Scrollozhatunk! Drag & drop! Select & pair!</p>
  <!-- <span>1.: {$count[1]}</span><br>
  <span>2.: {$count[2]}</span><br>
  <span>3.: {$count[3]}</span><br>
  <span>4.: {$count[4]}</span><br>
	<span>5.: {$count[5]}</span><br> -->
	<select bind:value={selected}>
		{#each components as component}
			<option value={component}>{component.idx} {component.name}</option>
		{/each}
	</select>

</header>

<main id="slides">
	<svelte:component this={selected.qtype} idx={selected.idx} />
	<!-- <Felelet idx={1} />
	<br>
	<Parosito idx={2} /> -->
</main>

<footer>
	<h6>2020. MÁRcius</h6>
</footer>
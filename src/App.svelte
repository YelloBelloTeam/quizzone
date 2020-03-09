<script>
	import Parosito from './qtypes/parosito.svelte'
	import Felelet from './qtypes/felelet.svelte'
	import Szabad from './qtypes/szabad.svelte'
	import { count } from './stores.js'
	/*
	svelte-loadable
	https://www.npmjs.com/package/svelte-loadable
	*/

	const components = [
		{ idx: 1, name: 'Párosító', qtype: Parosito, q: ['/images/city.jpeg', '/images/transport.jpeg', '/images/animals.jpeg', '/images/nature.jpeg', '/images/people.jpeg'], a:['PEOPLE', 'NATURE', 'ANIMALS', 'TRANSPORT', 'CITY'] },
		{ idx: 2, name: 'Feleletválasztó - képes', qtype: Felelet, q: 'Melyiküknek nincs PhD-fokozata?', a: ['/images/city.jpeg', '/images/transport.jpeg', '/images/animals.jpeg', '/images/nature.jpeg'] },
		{ idx: 3, name: 'Feleletválasztó - szöveges', qtype: Felelet, q: 'Douglas Adams Galaxis útikalauz stopposoknak című regényében honnan ered a 42, azaz a válasz a kérdések kérdésére?', a: ['Az angol To be kifejezésből, ahol a betűk abc sorszáma 4 és 2', 'Az ASCII kódolásban a 42 a „*” karaktert jelenti, ami az informatikában helyettesítő karakter, ami bármit helyettesíthet', 'Ez csak egy egyszerű poén, semmi jelentése nincs', 'Kínaiul a 4 (shi), japánul a 2 (ni), ha ezt összerakjuk (shini), és kanjikkal leírjuk, akkor a halál kifejezést kapjuk'], author: 'Laci, Júdea Népe Front' },
		{ idx: 4, name: 'Szabadválasz - vegyes', qtype: Szabad, q: ['/images/city.jpeg', '/images/transport.jpeg', 'Harmadik szöveges', '/images/animals.jpeg', '/images/nature.jpeg', '/images/people.jpeg', 'Utolsó is szöveges'], a: [] },
		{ idx: 5, name: 'Szabadválasz - solo', qtype: Szabad, q: 'Melyik az egyetlen nyári olimpiai sportág, melynek a székhelye Budapesten található és a nemzetközi szövetség elnöke is magyar?' },
	];

	let selected = components[3];

	let	q,
			a,
			author;
</script>

<header>
	<h1>Quizzone experiments!</h1>
	<p>Nem vagyunk "bezárva" egy képernyőbe, mint a projektoron! <br>Scrollozhatunk! Drag & drop! Select & pair!</p>
  <!-- <span>1.: {$count[1]}</span><br>
  <span>2.: {$count[2]}</span><br>
  <span>3.: {$count[3]}</span><br>
  <span>4.: {$count[4]}</span><br>
	<span>5.: {$count[5]}</span><br> -->
	<select bind:value={selected}>
		{#each components as component}
			<option value={component}>{component.idx}. {component.name}</option>
		{/each}
	</select>

</header>

<main id="slides">
	<svelte:component this={selected.qtype} idx={selected.idx} qs={selected.q} as={selected.a} name={selected.name} author={selected.author} />
</main>

<footer>
	<h6>2020. MÁRcius</h6>
</footer>
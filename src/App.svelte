<script>
	import Parosito from './qtypes/parosito.svelte';
	import Felelet from './qtypes/felelet.svelte';
	import { count } from './stores.js';
/* 
svelte-loadable
https://www.npmjs.com/package/svelte-loadable
*/
	let idx;
</script>

<header>
	<h1>Quizzone experiment!</h1>
	<h2>Kép-szöveg párosító</h2>
	<p>Nem vagyunk "bezárva" egy képernyőbe, mint a projektoron! <br>Scrollozhatunk! Drag & drop! Select & pair!</p>
  <span>1.: {$count[1]}</span><br>
  <span>2.: {$count[2]}</span><br>
  <span>3.: {$count[3]}</span><br>
  <span>4.: {$count[4]}</span><br>
  <span>5.: {$count[5]}</span><br>
</header>

<main id="questions">
	<Felelet idx={1} />
	<br>
	<Parosito idx={2} />
</main>

<footer>
	<h6>2020. FEBruár</h6>
</footer>
<script>
	import { count } from '../stores.js';
	// export let status;
	var selected;
	export let idx;
	const id = `s${idx}`

	function _focusFig(e) {
		let el = e 
		if (e.currentTarget) {
			e.cancelBubble = true;
			e.preventDefault();
			el = e.currentTarget
		}
		_blurEls()
		el.querySelector('#' + id + ' img').style.outline = getComputedStyle(document.documentElement).getPropertyValue('--outline-selected')
		selected = el
	}

	function _blurEls() {
		let old = document.querySelectorAll('#' + id + ' img')
		for (let o of old) o.style.outline = ''
		selected = null
	}

  function _dispatch(el) {
    selected.appendChild(el)
    // console.log(selected.querySelector('#' + id + ' img').alt)
    let c = count
    c[selected.querySelector('#' + id + ' img').alt] = el.id
    count.set(c)
  }

</script>

	<h1>Feleletválasztó</h1>
	<div id="{id}">
		<div class="as">
			<figure on:click={_focusFig}>
				<img src="/images/city.jpeg" alt="A">
			</figure>
			<figure on:click={_focusFig}>
				<img src="/images/transport.jpeg" alt="B">
			</figure>
			<figure on:click={_focusFig}>
				<img src="/images/animals.jpeg" alt="C">
			</figure>
			<figure on:click={_focusFig}>
				<img src="/images/nature.jpeg" alt="D">
			</figure>
		</div>
		<div class="qs">
			<h2>Melyiküknek nincs PhD-fokozata?</h2>
		</div>
	</div>
	<!-- <figure hidden><figcaption class="txt"></figcaption></figure> -->
<style>
	.qs, .as {
		/* width: 100%; */
		padding: 1rem;
	}
	.qs {
		position: sticky;
		bottom: 1rem;
	}
	.as {
		counter-reset: qnum;
	}
	.qs::before {
    content: '';
    position: absolute;
    width: 100%; 
    bottom: 0;
		top: 0;
		opacity: .75; 
    z-index: -1;
    background-color: var(--theme-color, orange);
	}


	figure {
		position: relative;
		margin: 1%;
		width: 31%;
	}
	figure::after {
		counter-increment: qnum;
		content: counter(qnum);
		position: absolute;
		left: -.25rem;
		top: 1rem;
		outline: solid 2px white;
		width: 2rem;
		text-align: center;
		background: var(--theme-color, orange);
		color: white;
	}

	figcaption {
		/* flex-grow: 1; */
		max-width: 31%;
		margin: .5rem 1%;
		padding: 0 .5rem;
		outline: solid 2px white;
		text-align: center;
		background: var(--theme-color, orange);
    color: white;
    cursor: move;
	}

	@media screen and (orientation:portrait) {
		figure {
			margin: 1%;
			width: 46%;
		}
		figcaption {
			max-width: 46%;
		}
	}

	/* párosítás után */
	figure :global(figcaption) {
		position: absolute;
		margin: 0 -.25rem;
		width: fit-content;
		max-width: unset;
		bottom: 1rem;
	}

</style>
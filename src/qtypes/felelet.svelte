<script>
	import { onMount } from 'svelte'
	import { count } from '../stores.js';
	// export let status;

	var selection,
			slide
	
	export let	idx,
							name,
							qs,
							as,
							author;

	const id = `s${idx}`

	onMount(() => {
		slide = document.querySelector('#' + id)
	});


	function _focusFig(e) {
		let el = e 
		if (e.currentTarget) {
			e.cancelBubble = true;
			e.preventDefault();
			el = e.currentTarget
		}
		_blurEls()
		el.querySelector('img').style.outline = getComputedStyle(document.documentElement).getPropertyValue('--outline-selected')
		selection = el
	}

	function _focusTxt(e) {
		let el = e 
		if (e.currentTarget) {
			e.cancelBubble = true;
			e.preventDefault();
			el = e.currentTarget
		}
		_blurEls()
		el.style.outline = getComputedStyle(document.documentElement).getPropertyValue('--outline-selected')
		selection = el
	}

	function _blurEls() {
		let old = slide.querySelectorAll('*')
		for (let o of old) o.style.outline = ''
		selection = null
	}

  function _dispatch(el) {
    selection.appendChild(el)
    // console.log(selection.querySelector('#' + id + ' img').alt)
    let c = count
    c[selection.querySelector('img').alt] = el.id
    count.set(c)
  }

</script>

	<h1>{name}</h1>
	<div id={id}>
		<div class="as">
			{#each as as a, i}
				{#if a.startsWith('/')}
				<figure on:click={_focusFig}>
					<img src={a} alt="{String.fromCharCode(65 + i)}">
				</figure>
				{:else}
				<p on:click={_focusTxt} alt="a{i}">{String.fromCharCode(65 + i)}) {a}</p>
				{/if}
			{/each}
		</div>
		<div class="qs">
			<h3>{qs} {#if author}<span>({author})</span>{/if}</h3>
		</div>
	</div>
	<!-- <figure hidden><figcaption class="txt"></figcaption></figure> -->
<style>
	.qs, .as {
		/* width: 100%; */
	}
	.qs {
		position: sticky;
		bottom: 1rem;
		padding: 1rem;
	}
	.as {
		counter-reset: qnum;
		min-height: 50vh;
		padding: 2rem 1rem;
		align-content: baseline;
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
		content: counters(qnum, '.', upper-alpha);
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

	.qs span {
		font-weight: lighter;
		font-style: italic;
	}

</style>
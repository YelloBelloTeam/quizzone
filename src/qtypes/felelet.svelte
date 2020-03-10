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
			/* e.cancelBubble = true;
			e.preventDefault(); */
			el = e.currentTarget
		}
		_blurEls()
		el.querySelector('.selectable').style.outline = getComputedStyle(document.documentElement).getPropertyValue('--outline-selected')
		selection = el
	}

	function _blurEls() {
		let old = slide.querySelectorAll('.selectable')
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
<div id={id} class="slide">
	<div class="multi">
		{#each as as a, i}
		<figure class="abcd" on:click={_focusFig}>
			{#if a.startsWith('/')}
			<img class="selectable" src={a} alt="{String.fromCharCode(65 + i)}">
			{:else}
			<p class="selectable" alt="a{i}">{a}</p>
			{/if}
		</figure>
		{/each}
	</div>
	<div class="qs sticky">
		<p>{qs} {#if author}<span class="author">({author})</span>{/if}</p>
	</div>
</div>

<style>

</style>
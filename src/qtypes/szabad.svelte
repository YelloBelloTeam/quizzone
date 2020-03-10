<script>
	import { onMount } from 'svelte'
	import { count } from '../stores.js';
	// export let status;

	var selection,
		slide

	export let idx,
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

	function _focusTxt(e) {
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
		c[selection.querySelector('.selectable').alt] = el.id
		count.set(c)
	}

</script>

<h1>{name}</h1>
<div id={id} class="slide">
	{#if Array.isArray(qs)}
	{#each qs as q, i}
	<div class="solo">
		<figure class="abcd" on:click={_focusFig}>
			<label for="q{i}">
				{#if q.startsWith('/')}
				<img class="selectable" src={q} alt="{String.fromCharCode(97 + i)}">
				{:else}
				<p class="selectable">{q}</p>
				{/if}
			</label>
		</figure>
		<div class="sticky free">
			<input id="q{i}" type="text" name="a[{i}]" value={as[i]} />
		</div>
	</div>
	{/each}
	{:else}
	<div class="solo">
		<figure on:click={_focusFig}>
			<label for="qsolo">
				{#if qs.startsWith('/')}
				<img class="selectable" src={qs} alt="q">
				{:else}
				<p class="selectable">{qs}</p>
				{/if}
			</label>
		</figure>
	</div>
	<div class="sticky free">
		<input id="qsolo" type="text" name="as" value={as} />
	</div>
	{/if}
</div>
	<!-- <figure hidden><figcaption class="txt"></figcaption></figure> -->
<style>

</style>
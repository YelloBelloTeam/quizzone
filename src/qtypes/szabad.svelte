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
	<div class="multi">
	{#each qs as q, i}
		<figure class="abcd">
			<label for="q{i}" on:click={_focusFig}>
				{#if q.startsWith('/')}
				<img class="selectable" src={q} alt="{String.fromCharCode(97 + i)}">
				{:else}
				<p class="selectable">{q}</p>
				{/if}
			</label>
			<div class="sticky free">
				<input id="q{i}" type="text" name="a[{i}]" value={as[i]} />
			</div>
		</figure>
	{/each}
	</div>
	{:else}
	<div class="solo">
		<figure>
			<label for="qsolo" on:click={_focusFig}>
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

<style>

</style>
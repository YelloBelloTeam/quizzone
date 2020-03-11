<script>
	import { onMount } from 'svelte'
	import { count } from '../stores.js';

	import { _idify } from '../utils.js';

	var	selection,
			slide

	export let	idx,
							name,
							qs,
							as;

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
		el.querySelector('.selectable').style.outline = getComputedStyle(document.documentElement).getPropertyValue('--outline-selected')
		selection = el
	}

	function _blurEls() {
		let old = slide.querySelectorAll('.selectable')
		for (let o of old) o.style.outline = ''
		selection = null
	}

	function _blurFig(ev) {
		ev.cancelBubble = true;
		ev.preventDefault();
		_blurEls()
	}

	function _moveTxt(e) {
		let el = e.target
		if (selection && selection.tagName == 'FIGURE') {
			let old = selection.querySelector('figcaption');
			if (old) slide.querySelector('.sticky').appendChild(old);
			if (old != el) {
				// selection.appendChild(el)
				_dispatch(el)
				if (selection.nextElementSibling) _focusFig(selection.nextElementSibling)
				else _focusFig(selection.parentNode.firstElementChild)
			}
		} else {
			slide.querySelector('.sticky').appendChild(el);
		}
	}

	function _dragover(e) {
		e.preventDefault();
//console.log('_dragover',e.dataTransfer.getData("text"))/* miért nincs meg a text? */
		if (e.dataTransfer.getData("text") || true) {
			let el = e.target
			_blurEls()
			if (el.tagName == 'FIGURE') /* console.log(e); */_focusFig(el)
			if (el.parentNode.tagName == 'FIGURE') _focusFig(el.parentNode)
		}
	}
	
	function _dragstart(e) {
		e.dataTransfer.setData("text", e.target.id);
		e.dataTransfer.dropEffect = "copy";
	}
	
	function _drop(e) {
		e.preventDefault();
		let el = document.getElementById(e.dataTransfer.getData("text"))
		if (el && el.tagName == 'FIGCAPTION') {
			let selection = e.target.parentNode
			if (selection.tagName == 'FIGURE') {
				let old = selection.querySelector('figcaption')
				if (old) slide.querySelector('.sticky').appendChild(old)
				// selection.appendChild(el)
				_dispatch(el)
				if (selection.nextElementSibling) _focusFig(selection.nextElementSibling)
				else _focusFig(selection.parentNode.firstElementChild)
			} else {
				slide.querySelector('.sticky').appendChild(el)
			}
		}
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
<div id={id} class="slide" on:drop={_drop} on:dragstart={_dragstart} on:dragover={_dragover}>
	<div class="multi" on:click|self={_blurFig}>
		{#each qs as q, i}
		<figure class="abcd" on:click={_focusFig}>
			{#if q.startsWith('/')}
			<img class="selectable" src={q} alt="{String.fromCharCode(65 + i)}">
			{:else}
			<p class="selectable" alt="{String.fromCharCode(65 + i)}">{q}</p>
			{/if}
		</figure>
		{/each}
	</div>
	<div class="multi sticky">
		{#each as as a, i}
		<figcaption id={_idify(a)} draggable="true" style="order:{i}" on:click={_moveTxt}>{a}</figcaption>
		{/each}
	</div>
</div>

<style>

</style>
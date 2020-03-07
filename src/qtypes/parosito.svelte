<script>
	import { count } from '../stores.js';
	// export let status;
	var selection;
	export let	idx,
							name,
							qs,
							as;

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
		selection = el
	}

	function _blurEls() {
		let old = document.querySelectorAll('#' + id + ' img')
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
			let old = selection.querySelector('#' + id + ' figcaption');
			if (old) document.querySelector('#' + id + ' .as').appendChild(old);
			if (old != el) {
				// selection.appendChild(el)
				_dispatch(el)
				if (selection.nextElementSibling) _focusFig(selection.nextElementSibling)
				else _focusFig(selection.parentNode.firstElementChild)
			}
		} else {
			document.querySelector('#' + id + ' .as').appendChild(el);
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
				let old = selection.querySelector('#' + id + ' figcaption')
				if (old) document.querySelector('#' + id + ' .as').appendChild(old)
				// selection.appendChild(el)
				_dispatch(el)
				if (selection.nextElementSibling) _focusFig(selection.nextElementSibling)
				else _focusFig(selection.parentNode.firstElementChild)
			} else {
				document.querySelector('#' + id + ' .as').appendChild(el)
			}
		}
  }
  
  function _dispatch(el) {
    selection.appendChild(el)
    // console.log(selection.querySelector('#' + id + ' img').alt)
    let c = count
    c[selection.querySelector('#' + id + ' img').alt] = el.id
    count.set(c)
  }

</script>

	<h1>{name}</h1>
	<div id="{id}" on:drop={_drop} on:dragstart={_dragstart} on:dragover={_dragover}>
		<div class="qs" on:click|self={_blurFig}>
			{#each qs as q}
			<figure on:click={_focusFig}>
				<img src="{q}" alt="q">
			</figure>
			{/each}
		</div>
		<div class="as">
			{#each as as a}
			<figcaption id="{a}" draggable="true" on:click={_moveTxt}>{a}</figcaption>
			{/each}
		</div>
	</div>
	<!-- <figure hidden><figcaption class="txt"></figcaption></figure> -->
<style>
	.qs, .as {
		/* width: 100%; */
		padding: 1rem;
	}
	.qs {
		counter-reset: qnum;
	}
	.as {
		position: sticky;
		bottom: 1rem;
	}
	.as::before {
    content: '';
    position: absolute;
    width: 100%; 
    top: 0;
		bottom: 0;
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
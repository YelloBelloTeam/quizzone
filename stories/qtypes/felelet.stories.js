import { action } from '@storybook/addon-actions';

import './../qtypes.css';
import '../../public/global.css';

import Felelet from '../../src/qtypes/felelet.svelte'

export default {
	title: 'Q-types/Feleletválasztó',
	component: Felelet,
};

export const Vegyes = () => ({
	Component: Felelet,
	props: { idx: 1, name: 'Feleletválasztó - Vegyes', qtype: Felelet, qs: ['Melyiküknek nincs PhD-fokozata?'], as: ['/images/city.jpeg', '/images/transport.jpeg', '/images/animals.jpeg', '/images/nature.jpeg', '/images/people.jpeg', 'Nekem.'] },
});

export const Szöveges = () => ({
	Component: Felelet,
	props: { idx: 1, name: 'Feleletválasztó - Szöveges', qtype: Felelet, qs: ['Douglas Adams Galaxis útikalauz stopposoknak című regényében honnan ered a 42, azaz a válasz a kérdések kérdésére?'], as: ['Az angol To be kifejezésből, ahol a betűk abc sorszáma 4 és 2', 'Az ASCII kódolásban a 42 a „*” karaktert jelenti, ami az informatikában helyettesítő karakter, ami bármit helyettesíthet', 'Ez csak egy egyszerű poén, semmi jelentése nincs', 'Kínaiul a 4 (shi), japánul a 2 (ni), ha ezt összerakjuk (shini), és kanjikkal leírjuk, akkor a halál kifejezést kapjuk'], author: 'Laci, Júdea Népe Front' },
});


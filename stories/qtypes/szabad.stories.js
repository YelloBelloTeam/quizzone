import { action } from '@storybook/addon-actions';

import './../qtypes.css';
import '../../public/global.css';

import Szabad from '../../src/qtypes/szabad.svelte'

export default {
	title: 'Q-types/Szabadszöveges',
	component: Szabad,
};

export const Képes = () => ({
	Component: Szabad,
	props: { idx: 1, name: 'Szabadszöveges - Képes', qtype: Szabad, qs: ['/images/city.jpeg', '/images/transport.jpeg', '/images/animals.jpeg', '/images/nature.jpeg', '/images/people.jpeg'], as: ['People', 'Nature', 'Animals', 'Transport', 'City'] },
});

export const Vegyes = () => ({
	Component: Szabad,
	props: { idx: 1, name: 'Szabadszöveges - Vegyes', qtype: Szabad, qs: ['/images/city.jpeg', '/images/transport.jpeg', 'A harmadik egy szöveges', '/images/animals.jpeg', '/images/nature.jpeg', '/images/people.jpeg'], as: ['People', 'Nature', 'Animals', 'Transport', 'City'] },
});


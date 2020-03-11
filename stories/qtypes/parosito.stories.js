import { action } from '@storybook/addon-actions';

import './../qtypes.css';
import '../../public/global.css';

import Parosito from '../../src/qtypes/parosito.svelte'

export default {
	title: 'Q-types/Párosító',
	component: Parosito,
};

export const Képes = () => ({
	Component: Parosito,
	props: { idx: 1, name: 'Párosító - Képes', qtype: Parosito, qs: ['/images/city.jpeg', '/images/transport.jpeg', '/images/animals.jpeg', '/images/nature.jpeg', '/images/people.jpeg'], as: ['People', 'Nature', 'Animals', 'Transport', 'City'] },
});

export const Vegyes = () => ({
	Component: Parosito,
	props: { idx: 1, name: 'Párosító - Vegyes', qtype: Parosito, qs: ['/images/city.jpeg', '/images/transport.jpeg', 'A harmadik egy szöveges', '/images/animals.jpeg', '/images/nature.jpeg', '/images/people.jpeg'], as: ['People', 'Nature', 'Animals', 'Transport', 'City'] },
});


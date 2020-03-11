import { action } from '@storybook/addon-actions';

import './../qtypes.css';
import '../../public/global.css';

import Parosito from '../../src/qtypes/parosito.svelte'

export default {
	title: 'Q-types/Parosito',
	component: Parosito,
};

export const parositoCsakKep = () => ({
	Component: Parosito,
	props: { idx: 1, name: 'Párosító', qtype: Parosito, qs: ['/images/city.jpeg', '/images/transport.jpeg', '/images/animals.jpeg', '/images/nature.jpeg', '/images/people.jpeg'], as: ['People', 'Nature', 'Animals', 'Transport', 'City'] },
});

export const parositoVegyes = () => ({
	Component: Parosito,
	props: { idx: 1, name: 'Párosító', qtype: Parosito, qs: ['/images/city.jpeg', '/images/transport.jpeg', 'A harmadik egy szöveges', '/images/animals.jpeg', '/images/nature.jpeg', '/images/people.jpeg'], as: ['People', 'Nature', 'Animals', 'Transport', 'City'] },
});


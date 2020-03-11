import { action } from '@storybook/addon-actions';

import './../qtypes.css';
import '../../public/global.css';

import Felelet from '../../src/qtypes/felelet.svelte'

export default {
	title: 'Q-types/Felelet',
	component: Felelet,
};

export const feleletCsakKep = () => ({
	Component: Felelet,
	props: { idx: 1, name: 'Párosító', qtype: Felelet, qs: ['/images/city.jpeg', '/images/transport.jpeg', '/images/animals.jpeg', '/images/nature.jpeg', '/images/people.jpeg'], as: ['People', 'Nature', 'Animals', 'Transport', 'City'] },
});

export const feleletVegyes = () => ({
	Component: Felelet,
	props: { idx: 1, name: 'Párosító', qtype: Felelet, qs: ['/images/city.jpeg', '/images/transport.jpeg', 'A harmadik egy szöveges', '/images/animals.jpeg', '/images/nature.jpeg', '/images/people.jpeg'], as: ['People', 'Nature', 'Animals', 'Transport', 'City'] },
});


import { youdao } from 'translation.js';

export default function (q: string) {
	return youdao.translate(q);
}
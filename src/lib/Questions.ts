import quantum_body from '$lib/songs/quantum_body_ai.mp3';
import living_mice from '$lib/songs/Living_Mice.mp3';
import life_in_technicolor from '$lib/songs/life_in_technicolor.mp3';
import swirl from '$lib/songs/swirl.mp3';
import the_folky_way from '$lib/songs/the_folky_way.mp3';
import do_you_really_live_here from '$lib/songs/do_you_really_live_here.mp3';
import nostalgia from '$lib/songs/nostalgia.mp3';
import midnight from '$lib/songs/midnight.mp3';
import oogway_ascends from '$lib/songs/oogway_ascends.mp3';
import remains from "$lib/songs/remains.mp3"
interface Song {
	songName: string;
	url: string;
	startFrom: number;
	volume: number
}

interface Question {
	song1: Song;
	song2: Song;
	whichIsAI: number;
}

function song(songName: string, url: string, startFrom: number = NaN, volume = 1) {
	return {
		songName,
		url,
		startFrom,
		volume
	};
}

function question(song1: Song, song2: Song, whichIsAI: number) {
	if (!(whichIsAI === 1 || whichIsAI === 2)) throw Error('Invalid');
	return <Question>{ song1, song2, whichIsAI };
}

export const questions = [
	question(
		song('I Sing Your Quantum Body - AI', quantum_body, NaN, 0.8),
		song('Living Mice - C418', living_mice, 89),
		1
	),
	question(
		song('Life in Technicolor - Coldplay', life_in_technicolor, 34),
		song('Swirl - AI', swirl, NaN, 0.8),
		2
	),
	question(song('Nostalgia - Teau', nostalgia, 11), song('Midnight - AI', midnight), 2),
	question(song('The Folky Way - AI', the_folky_way), song('Oogway Ascends - Hans Zimmer', oogway_ascends, 45), 1),
	question(song('Do You Really Live Here - AI', do_you_really_live_here), song('Remains - Volker Bertelmann', remains, 25), 1)
];


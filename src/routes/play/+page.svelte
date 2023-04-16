<script lang="ts">
	import { questions } from '$lib/Questions';
	import { onMount } from 'svelte';

	import Timer from 'easytimer.js';

	export let data;

	let correct_: any = null;
	$: correct = correct_;

	$: displaySong1 = '__________';
	$: displaySong2 = '__________';
	$: score = NaN;
	$: questionNo = NaN;
	$: class_ = '';

	let audio: string;

	interface ClassStorage {
		grade: number;
		section: string;
	}
	let p_: ClassStorage;
	$: parsedStorage = p_;

	let audio1: HTMLAudioElement;
	let audio2: HTMLAudioElement;

	$: classGlob = {};
	async function normalizeAudio(elem: HTMLAudioElement, url: string) {
		var audioCtx = new AudioContext();
		var src = audioCtx.createMediaElementSource(elem);
		var gainNode = audioCtx.createGain();
		gainNode.gain.value = 1.0;
		elem.addEventListener(
			'play',
			async function () {
				src.connect(gainNode);
				gainNode.connect(audioCtx.destination);
			},
			true
		);
		elem.addEventListener(
			'pause',
			async function () {
				// disconnect the nodes on pause, otherwise all nodes always run
				src.disconnect(gainNode);
				gainNode.disconnect(audioCtx.destination);
			},
			true
		);
		await fetch(url)
			.then(function (res) {
				return res.arrayBuffer();
			})
			.then(function (buf) {
				return audioCtx.decodeAudioData(buf);
			})
			.then(function (decodedData) {
				var decodedBuffer = decodedData.getChannelData(0);
				var sliceLen = Math.floor(decodedData.sampleRate * 0.05);
				var averages = [];
				var sum = 0.0;
				for (var i = 0; i < decodedBuffer.length; i++) {
					sum += decodedBuffer[i] ** 2;
					if (i % sliceLen === 0) {
						sum = Math.sqrt(sum / sliceLen);
						averages.push(sum);
						sum = 0;
					}
				}
				// Ascending sort of the averages array
				averages.sort(function (a, b) {
					return a - b;
				});
				// Take the average at the 95th percentile
				var a = averages[Math.floor(averages.length * 0.95)];

				var gain = 1.0 / a;
				// Perform some clamping
				// gain = Math.max(gain, 0.02);
				// gain = Math.min(gain, 100.0);

				// ReplayGain uses pink noise for this one one but we just take
				// some arbitrary value... we're no standard
				// Important is only that we don't output on levels
				// too different from other websites
				gain = gain / 10.0;
				console.log('gain determined', elem, a, gain);
				gainNode.gain.value = gain;
			});
	}
	onMount(async () => {
		if (!localStorage.getItem('class')) window.location.pathname = '/';
		parsedStorage = JSON.parse(localStorage.class);
		class_ = parsedStorage.grade.toString() + parsedStorage.section;

		let thisClass: any;

		//  @ts-ignore
		thisClass = data.classes.filter((obj: object) => {
			// @ts-ignore
			return obj.grade === parsedStorage.grade && obj.section === parsedStorage.section;
		})[0];

		console.log(thisClass);

		questionNo = thisClass.scores.length + 1;
		if (questionNo > questions.length) return (window.location.pathname = '/end');

		let song1 = questions[questionNo - 1].song1;
		let song2 = questions[questionNo - 1].song2;

		audio1 = new Audio(song1.url);
		audio2 = new Audio(song2.url);

		audio1.play();
		audio1.pause();
		audio2.play();
		audio2.pause();

		normalizeAudio(audio1, song1.url);
		normalizeAudio(audio2, song2.url);

		audio1.play();
		audio1.pause();
		audio2.play();
		audio2.pause();

		if (song1.startFrom) {
			audio1.currentTime = song1.startFrom;
		}
		if (song2.startFrom) {
			audio2.currentTime = song2.startFrom;
		}

		if (thisClass.scores.length === 0) {
			score = 0;
		} else {
			score = thisClass.scores[thisClass.scores.length - 1];
		}
	});

	$: timers = [40, 40];
	$: startedTimers = [false, false];
	$: countdownFinished = [false, false];
	let interval1: any;
	let interval2: any;

	function toggleStart(songN: number) {
		if (songN !== 1 && songN !== 2) return;
		if (songN === 1) {
			if (startedTimers[0] === false && countdownFinished[0] === false) {
				audio1.play();
				audio2.pause();
				startedTimers[0] = true;
				startedTimers[1] = false;
				clearInterval(interval2);
				if (!(timers[0] <= 0)) {
					interval1 = setInterval(async () => {
						timers[0] -= 1;
						if (timers[0] <= 0 || answerChosen) {
							countdownFinished[0] = true;
							clearInterval(interval1);
							let fadeInterval = setInterval(async () => {
								if (audio1.volume <= 0.01) {
									audio1.volume = 0;
									clearInterval(fadeInterval);
									audio1.pause();
								} else {
									audio1.volume -= 0.01;
								}
							}, 50);
						}
					}, 1000);
				}
			} else {
				if (!countdownFinished[0]) {
					audio1.pause();
					clearInterval(interval1);
					startedTimers[0] = false;
				}
			}
		} else {
			if (startedTimers[1] === false && countdownFinished[1] === false) {
				audio2.play();
				audio1.pause();
				startedTimers[1] = true;
				startedTimers[0] = false;
				clearInterval(interval1);
				if (!(timers[1] <= 0)) {
					interval2 = setInterval(async () => {
						timers[1] -= 1;
						if (timers[1] <= 0 || answerChosen) {
							countdownFinished[1] = true;
							clearInterval(interval2);
							let fadeInterval = setInterval(async () => {
								if (audio2.volume <= 0.01) {
									audio2.volume = 0;
									clearInterval(fadeInterval);
									audio2.pause();
								} else {
									audio2.volume -= 0.01;
								}
							}, 50);
						}
					}, 1000);
				}
			} else {
				if (!countdownFinished[1]) {
					audio2.pause();
					clearInterval(interval2);
					startedTimers[1] = false;
				}
			}
		}
		console.log(timers[0], timers[1], startedTimers);
	}
	$: points = 0;
	$: answerChosen = false;
	let form_: HTMLFormElement;
	$: form = form_;

	$: statusMessage = '';
	function handleAnswer(isAI: number) {
		if (isAI !== 1 && isAI !== 2) return;

		if (isAI === questions[questionNo - 1].whichIsAI) {
			correct = true;
			points = 500;
			score = score + points;
		} else {
			correct = false;
		}

		displaySong1 = questions[questionNo - 1].song1.songName;
		displaySong2 = questions[questionNo - 1].song2.songName;
		answerChosen = true;

		audio1.pause();
		audio2.pause();

		statusMessage = 'Sending to leaderboard...';
		setTimeout(() => {
			form.submit();
		}, 4500);
	}
</script>

<div class="flex w-screen justify-between p-4 bg-slate-900">
	<div class="text-3xl relative">
		Question {questionNo}
	</div>
	<div class="text-3xl justify-self-end">
		<span class="font-semibold">Score: </span>{score}
	</div>
</div>
<!-- <div
	class="absolute m-auto w-screen top-0 left-0 h-[64px] flex justify-center items-center text-4xl font-bold"
>
	{displaySong}
</div> -->
<form class="hidden" bind:this={form} method="post">
	<input name="points" value={points} />
	<input name="question" value={questionNo} />
	<input name="grade" value={parsedStorage?.grade} />
	<input name="section" value={parsedStorage?.section} />
	<input name="score" value={score} />
</form>
<div
	class="w-[100vw] h-[80vh] flex flex-col text-center justify-center items-center relative text-9xl"
>
	<div class="mb-8" />

	<div class="flex flex-col justify-center items-center">
		<div class="flex flex-row justify-center items-center gap-80">
			<div class="flex flex-col items-center justify-center text-center">
				<div class="text-white text-xl mb-4">{displaySong1}</div>
				<div class="text-white text-7xl mb-4">{timers[0]}</div>
				<button
					disabled={countdownFinished[0] || answerChosen}
					class="text-orange-400 hover:saturate-150 active:brightness-50 flex flex-col items-center text-5xl {countdownFinished[0] ||
					answerChosen
						? 'saturate-0 hover:saturate-0 active:brightness-100'
						: ''}"
					on:click={() => toggleStart(1)}
					><svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 24 24"
						><path
							fill="currentColor"
							d={startedTimers[0]
								? 'M10 16q.425 0 .713-.288T11 15V8.975q0-.425-.288-.7T10 8q-.425 0-.713.288T9 9v6.025q0 .425.288.7T10 16Zm4 0q.425 0 .713-.288T15 15V8.975q0-.425-.288-.7T14 8q-.425 0-.713.288T13 9v6.025q0 .425.288.7T14 16Zm-2 6q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Zm0-10Zm0 8q3.325 0 5.663-2.337T20 12q0-3.325-2.337-5.663T12 4Q8.675 4 6.337 6.337T4 12q0 3.325 2.337 5.663T12 20Z'
								: 'M9.5 9.325v5.35q0 .6.525.875t1.025-.05l4.15-2.65q.475-.275.475-.85t-.475-.85L11.05 8.5q-.5-.325-1.025-.05t-.525.875ZM12 22q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Zm0-10Zm0 8q3.325 0 5.663-2.337T20 12q0-3.325-2.337-5.663T12 4Q8.675 4 6.337 6.337T4 12q0 3.325 2.337 5.663T12 20Z'}
						/></svg
					>
					{startedTimers[0] ? 'Pause' : 'Play'}</button
				>
				<button
					disabled={answerChosen}
					class="bg-green-600 px-5 py-2 rounded-2xl border-2 border-white text-4xl mt-12 {answerChosen
						? 'saturate-0'
						: 'hover:saturate-150'}"
					on:click={() => handleAnswer(1)}
				>
					This is AI
				</button>
			</div>
			<div class="w-1 h-[110%] rounded-lg bg-gray-200" />
			<div class="flex flex-col items-center">
				<div class="text-white text-xl mb-4">{displaySong2}</div>
				<div class="text-white text-7xl mb-4">{timers[1]}</div>
				<button
					disabled={countdownFinished[1] || answerChosen}
					class="text-orange-400 hover:saturate-150 active:brightness-50 flex flex-col items-center text-5xl {countdownFinished[1] ||
					answerChosen
						? 'saturate-0 hover:saturate-0 active:brightness-100'
						: ''}"
					on:click={() => toggleStart(2)}
					><svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 24 24"
						><path
							fill="currentColor"
							d={startedTimers[1]
								? 'M10 16q.425 0 .713-.288T11 15V8.975q0-.425-.288-.7T10 8q-.425 0-.713.288T9 9v6.025q0 .425.288.7T10 16Zm4 0q.425 0 .713-.288T15 15V8.975q0-.425-.288-.7T14 8q-.425 0-.713.288T13 9v6.025q0 .425.288.7T14 16Zm-2 6q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Zm0-10Zm0 8q3.325 0 5.663-2.337T20 12q0-3.325-2.337-5.663T12 4Q8.675 4 6.337 6.337T4 12q0 3.325 2.337 5.663T12 20Z'
								: 'M9.5 9.325v5.35q0 .6.525.875t1.025-.05l4.15-2.65q.475-.275.475-.85t-.475-.85L11.05 8.5q-.5-.325-1.025-.05t-.525.875ZM12 22q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Zm0-10Zm0 8q3.325 0 5.663-2.337T20 12q0-3.325-2.337-5.663T12 4Q8.675 4 6.337 6.337T4 12q0 3.325 2.337 5.663T12 20Z'}
						/></svg
					>
					{startedTimers[1] ? 'Pause' : 'Play'}</button
				>
				<button
					disabled={answerChosen}
					class="bg-green-600 px-5 py-2 rounded-2xl border-2 border-white text-4xl mt-12 {answerChosen
						? 'saturate-0'
						: 'hover:saturate-150'}"
					on:click={() => handleAnswer(2)}
				>
					This is AI
				</button>
			</div>
		</div>
		<div class="mt-12 flex flex-col items-center gap-y-4">
			{#if correct === true}
				<div class="text-4xl text-green-400 font-bold">Correct! +500 points</div>
			{:else if correct === false}
				<div class="text-4xl text-red-400 font-bold">Wrong.</div>
			{/if}
			<div class="text-2xl font-light">{statusMessage}</div>
		</div>
	</div>
</div>

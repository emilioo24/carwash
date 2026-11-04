<script lang="ts">
	import { tick } from 'svelte';
	import { addDays, formatDateSpoken, MONTHS, weekdayOf } from '#lib/utils/date';
	import type { ISODate } from '#lib/types';

	interface Props {
		today: ISODate;
		bookableDates: ISODate[];
		value: ISODate;
		onselect: (date: ISODate) => void;
		describedBy?: string;
	}

	let { today, bookableDates, value, onselect, describedBy }: Props = $props();

	const WEEK = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
	const WEEK_FULL = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
	const monthOf = (date: ISODate) => date.slice(0, 7);

	// svelte-ignore state_referenced_locally
	let month = $state(monthOf(value || today));
	let grid = $state<HTMLElement>();

	const bookable = $derived(new Set(bookableDates));
	const firstMonth = $derived(monthOf(today));
	const lastMonth = $derived(monthOf(bookableDates.at(-1) ?? today));

	const shiftMonth = (current: string, delta: number) => {
		const [year, number] = current.split('-').map(Number);
		const date = new Date(Date.UTC(year, number - 1 + delta, 1));
		return date.toISOString().slice(0, 7);
	};

	const title = $derived.by(() => {
		const [year, number] = month.split('-').map(Number);
		return `${MONTHS[number - 1]} ${year}`;
	});

	const cells = $derived.by(() => {
		const first = `${month}-01`;
		const leading = (weekdayOf(first) + 6) % 7; // lunes primero
		const days: (ISODate | null)[] = Array.from({ length: leading }, () => null);
		for (let date = first; monthOf(date) === month; date = addDays(date, 1)) days.push(date);
		return days;
	});

	async function onKeydown(event: KeyboardEvent, date: ISODate) {
		const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
		const delta = moves[event.key];
		if (!delta) return;
		event.preventDefault();

		let target = addDays(date, delta);
		const limit = bookableDates.at(-1) ?? today;
		while (!bookable.has(target) && target >= today && target <= limit) {
			target = addDays(target, delta > 0 ? 1 : -1);
		}
		if (!bookable.has(target)) return;

		month = monthOf(target);
		await tick();
		grid?.querySelector<HTMLButtonElement>(`[data-date="${target}"]`)?.focus();
	}
</script>

<div class="calendar" aria-describedby={describedBy}>
	<div class="bar">
		<button
			type="button"
			aria-label="Mes anterior"
			disabled={month <= firstMonth}
			onclick={() => (month = shiftMonth(month, -1))}
		>
			‹
		</button>
		<p aria-live="polite">{title}</p>
		<button
			type="button"
			aria-label="Mes siguiente"
			disabled={month >= lastMonth}
			onclick={() => (month = shiftMonth(month, 1))}
		>
			›
		</button>
	</div>

	<div class="grid" bind:this={grid}>
		{#each WEEK as day, index}
			<abbr title={WEEK_FULL[index]}>{day}</abbr>
		{/each}
		{#each cells as date, index (date ?? `empty-${index}`)}
			{#if date}
				<button
					type="button"
					class="day"
					class:today={date === today}
					class:selected={date === value}
					data-date={date}
					disabled={!bookable.has(date)}
					aria-pressed={date === value}
					aria-label={formatDateSpoken(date)}
					onclick={() => onselect(date)}
					onkeydown={(event) => onKeydown(event, date)}
				>
					{Number(date.slice(-2))}
				</button>
			{:else}
				<span></span>
			{/if}
		{/each}
	</div>
</div>

<style>
	.calendar {
		border: 1px solid var(--line);
		border-radius: 18px;
		background: var(--color-ink);
		padding: 12px;
	}

	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;
	}

	.bar p {
		font-weight: 700;
		text-transform: capitalize;
	}

	.bar button {
		width: 44px;
		height: 44px;
		border-radius: 12px;
		font-size: 1.625rem;
		line-height: 1;
		cursor: pointer;
	}

	.bar button:hover:not(:disabled) {
		background: var(--color-panel);
	}

	.bar button:disabled {
		cursor: not-allowed;
		opacity: 0.25;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 2px;
		text-align: center;
	}

	abbr {
		padding-block: 6px;
		color: var(--color-mist);
		font-size: 0.8125rem;
		font-weight: 600;
		text-decoration: none;
	}

	.day {
		aspect-ratio: 1;
		min-height: 40px;
		border-radius: 12px;
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color 0.15s,
			color 0.15s,
			scale 0.25s var(--bounce);
	}

	.day:hover:not(:disabled) {
		background: var(--color-panel);
	}

	.day:disabled {
		color: rgb(154 166 176 / 0.5);
		text-decoration: line-through;
		font-weight: 400;
		cursor: not-allowed;
	}

	.day.today {
		box-shadow: inset 0 0 0 1px var(--color-water);
	}

	.day.selected,
	.day.selected:hover:not(:disabled) {
		background: var(--color-orange);
		color: var(--color-ink);
		scale: 1.05;
	}
</style>

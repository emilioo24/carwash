<script lang="ts">
	import SocialIcon from '#lib/components/ui/SocialIcon.svelte';

	interface Props {
		phone: string;
		name: string;
	}

	let { phone, name }: Props = $props();

	const href = $derived(`https://wa.me/${phone}?text=${encodeURIComponent(`¡Hola ${name}!`)}`);
</script>

<a {href} target="_blank" rel="noopener" aria-label="Escribinos por WhatsApp">
	<SocialIcon name="whatsapp" size="32px" />
</a>

<style>
	a {
		position: fixed;
		right: 16px;
		bottom: 16px;
		z-index: 30;
		display: grid;
		place-items: center;
		width: 58px;
		height: 58px;
		border-radius: 50%;
		background: #25d366;
		color: #0c2a17;
		box-shadow: 0 8px 24px rgb(0 0 0 / 0.45);
	}

	@media (min-width: 768px) {
		a {
			display: none;
		}
	}
</style>

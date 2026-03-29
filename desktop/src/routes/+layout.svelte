<script lang="ts">
	import "../app.css";
	import { onMount } from "svelte";
	import { Sidebar, StatusBar } from "$lib/components/ui";
	import { SettingsPanel } from "$lib/components/Settings";
	import { ChatView } from "$lib/components/Chat";
	import { initTheme } from "$lib/stores/theme";
	import { currentView } from "$lib/stores/app";

	onMount(() => {
		initTheme();
	});
</script>

<div class="app-layout">
	<div class="app-body">
		<Sidebar />
		<div class="main-area">
			{#if $currentView === "settings"}
				<SettingsPanel />
			{:else}
				<ChatView channelName="nanobot" />
			{/if}
		</div>
	</div>
	<StatusBar />
</div>

<style>
	.app-layout {
		display: flex;
		flex-direction: column;
		height: 100vh;
		height: 100dvh; /* 支持动态视口高度 */
		overflow: hidden;
	}

	.app-body {
		display: flex;
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}

	.main-area {
		display: flex;
		flex: 1;
		min-width: 0;
		min-height: 0;
		overflow: hidden;
	}
</style>

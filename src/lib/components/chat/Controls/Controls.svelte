<script lang="ts">
	import { createEventDispatcher, getContext } from 'svelte';
	const dispatch = createEventDispatcher();
	const i18n = getContext('i18n');

	import XMark from '$lib/components/icons/XMark.svelte';
	import AdvancedParams from '../Settings/Advanced/AdvancedParams.svelte';
	import Valves from '$lib/components/chat/Controls/Valves.svelte';
	import FileItem from '$lib/components/common/FileItem.svelte';
	import Collapsible from '$lib/components/common/Collapsible.svelte';
	import { writable } from "svelte/store";

	import { user } from '$lib/stores';
	import { fetchUserContext } from '$lib/apis/user-context';

	export let models = [];
	export let chatFiles = [];
	export let params = {};
	let lookbackMinutes = 5
	let showValves = false;
	let loading = writable(false)

	const callfetchUserContext = async () => {

        try {
			$loading = true
            const response = await fetchUserContext(localStorage.token, lookbackMinutes)
			if (!response) {
				throw new Error("Failed to fetch data");
			}
            const data = await response.json() || "Success!";
			console.log(data)
			console.log(data.similar_events)
			console.log(data.user_events)
			const combinedText = `\nBelow are the recent user interactions, which are provided in order of time  \n--- User Events ---\n${data.user_events.join("\n")}\n\n
			These are the similar events done across user’s organization. These interactions are similar to the action performed by the user, in order of their similarity\n\n--- Similar Processes ---\n${data.similar_events.join("\n")}`;
			console.log(combinedText)
			dispatch("updateParams", { system: combinedText });
        } catch (error) {
			console.error("Error fetching user context:", error);
		} finally {
			$loading=false;
		}
    }
</script>

<div class=" dark:text-white">
	<div class=" flex items-center justify-between dark:text-gray-100 mb-2">
		<div class=" text-lg font-medium self-center font-primary">{$i18n.t('Chat Controls')}</div>
		<button
			class="self-center"
			on:click={() => {
				dispatch('close');
			}}
		>
			<XMark className="size-3.5" />
		</button>
	</div>

	{#if $user.role === 'admin' || $user?.permissions.chat?.controls}
		<div class=" dark:text-gray-200 text-sm font-primary py-0.5 px-0.5">
			{#if chatFiles.length > 0}
				<Collapsible title={$i18n.t('Files')} open={true} buttonClassName="w-full">
					<div class="flex flex-col gap-1 mt-1.5" slot="content">
						{#each chatFiles as file, fileIdx}
							<FileItem
								className="w-full"
								item={file}
								edit={true}
								url={file?.url ? file.url : null}
								name={file.name}
								type={file.type}
								size={file?.size}
								dismissible={true}
								on:dismiss={() => {
									// Remove the file from the chatFiles array

									chatFiles.splice(fileIdx, 1);
									chatFiles = chatFiles;
								}}
								on:click={() => {
									console.log(file);
								}}
							/>
						{/each}
					</div>
				</Collapsible>

				<hr class="my-2 border-gray-50 dark:border-gray-700/10" />
			{/if}

			<Collapsible bind:open={showValves} title={$i18n.t('Valves')} buttonClassName="w-full">
				<div class="text-sm" slot="content">
					<Valves show={showValves} />
				</div>
			</Collapsible>

			<hr class="my-2 border-gray-50 dark:border-gray-700/10" />

			<Collapsible title={$i18n.t('System Prompt')} open={true} buttonClassName="w-full">
				<div class="" slot="content">
					<textarea
						bind:value={params.system}
						class="w-full text-xs py-3.0 bg-transparent outline-hidden resize-none"
						rows="4"
						placeholder={$i18n.t('Enter system prompt')}
					/>
				</div>
			</Collapsible>

			<div class="flex py-0.5 w-full justify-between">
				<div class='self-center text-left'>
					<label class="">Lookback Time (Minutes):</label>
    				<input type="number" bind:value={lookbackMinutes} min="1" placeholder=5/>
				</div>
				<button on:click={callfetchUserContext} disabled={$loading} class='self-center text-right'>
					{$loading ? "Loading..." : "Fetch user interactions"}
				</button>
			</div>

			<hr class="my-2 border-gray-50 dark:border-gray-700/10" />

			<Collapsible title={$i18n.t('Advanced Params')} open={true} buttonClassName="w-full">
				<div class="text-sm mt-1.5" slot="content">
					<div>
						<AdvancedParams admin={$user?.role === 'admin'} bind:params />
					</div>
				</div>
			</Collapsible>
		</div>
	{:else}
		<div class="text-sm dark:text-gray-300 text-center py-2 px-10">
			{$i18n.t('You do not have permission to access this feature.')}
		</div>
	{/if}
</div>

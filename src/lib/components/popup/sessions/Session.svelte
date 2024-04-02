<script lang="ts">
  import type { EDragWindow, ESession, EWindow } from '@/lib/types';
  import { createEventDispatcher } from 'svelte';
  import { settings, filterOptions, sessions } from '@/lib/stores';
  import { IconButton, Tag } from '@/lib/components';
  import {
    tooltip,
    sendMessage,
    markResult,
    sessionsDB,
    getRelativeTime
  } from '@/lib/utils';
  import type { UUID } from 'crypto';
  import { i18n } from 'webextension-polyfill';

  export let session: ESession;

  $: selected = sessions.selection;

  const dispatch = createEventDispatcher();

  $: title = $filterOptions?.query.trim()
    ? markResult(session?.title, $filterOptions?.query, {
        case_sensitive: false
      })
    : session?.title;

  async function openSession() {
    if (!session.windows[0]?.tabs?.length)
      session.windows = (await sessionsDB.loadSessionWindows(
        session.id as UUID
      )) as EWindow[];

    sendMessage({
      message: 'openSession',
      session,
      discarded: $settings.discarded
    });

    session.windows = { length: session.windows.length } as EWindow[];
  }

  function removeWindow(
    session: ESession,
    windowIndex: number
  ): EWindow | undefined {
    if (!session || !session.windows) return;
    const result = session.windows.splice(windowIndex, 1)[0];
    return result;
  }

  async function addWindow(
    session: ESession,
    window: EWindow
  ): Promise<ESession | undefined> {
    if (!session) return;

    if (!Array.isArray(session.windows)) {
      session.windows = (await sessionsDB.loadSessionWindows(
        session.id as UUID
      ))!;
    }

    session.windows.splice(0, 0, window);
    console.log('atfer push', session.windows);
    return session;
  }

  async function drop(event: EDragWindow) {
    const sessionId = event.dataTransfer?.getData('sessionId');
    const wIdx = event.dataTransfer?.getData('windowIndex');
    if (wIdx == null || sessionId == null) {
      console.log('drop failed', event);
      return;
    }

    // no effect for same session drag and drop
    if (sessionId == session.id) {
      return;
    }

    const windowIndex = parseInt(wIdx);
    const sessionToRemove = $sessions.find((s) => s.id == sessionId);
    let sessionToAdd = $sessions.find((s) => s.id == session.id);

    if (sessionToRemove == undefined || sessionToAdd == undefined) {
      console.log('drop failed', event, sessionToRemove, sessionToAdd);
      return;
    }

    // delete from original session
    const windowRemoved = removeWindow(sessionToRemove, windowIndex);
    if (windowRemoved == undefined) {
      return;
    }

    // insert to dragged to session
    sessionToAdd = (await addWindow(sessionToAdd, windowRemoved)) as ESession;

    await sessions.put(sessionToRemove);
    await sessions.put(sessionToAdd);

    selected.select(sessionToAdd);
    console.log('drop done', windowIndex, sessionId);
  }

  async function dragover(event: EDragWindow) {
    event.preventDefault();
  }
</script>

<li on:drop={drop} on:dragover={dragover}>
  <button
    class="session-container group {$selected?.id === session.id
      ? '!bg-primary/30'
      : ''}"
    on:click={() => selected.select(session)}
  >
    <div class="session-info">
      <button
        use:tooltip={{ title: i18n.getMessage('popupTipOpen') }}
        class="session-name"
        on:click|stopPropagation={openSession}
      >
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html title}
      </button>

      <IconButton
        icon="rename"
        title={i18n.getMessage('labelRename')}
        class="ml-auto hidden text-xl  hover:text-primary-focus group-hover:block"
        on:click={() => {
          dispatch('renameModal');
        }}
      />

      <IconButton
        icon={session?.tags ? 'untag' : 'tag'}
        title={i18n.getMessage(session.tags ? 'labelRemoveTag' : 'labelAddTag')}
        class="hidden text-xl hover:text-primary-focus group-hover:block"
        on:click={() => {
          if (!session?.tags) return dispatch('tagsModal');

          delete session.tags;

          sessions.put(session);
        }}
      />

      <IconButton
        icon="delete"
        title={i18n.getMessage('labelDelete')}
        class="hidden text-xl text-error hover:text-error-focus group-hover:block"
        on:click={() => dispatch('deleteModal')}
      />
    </div>

    <div class="mt-2 flex w-full flex-1 gap-2">
      <div
        class="session-card"
        use:tooltip={{
          title: `${session?.windows?.length} ${i18n.getMessage(
            session?.windows?.length > 1 ? 'labelWindows' : 'labelWindow'
          )}`
        }}
      >
        <IconButton icon="window" class="text-sm" role="img" />
        {session?.windows?.length}
      </div>

      <div
        class="session-card"
        use:tooltip={{
          title: `${session?.tabsNumber} ${i18n.getMessage(
            session?.tabsNumber > 1 ? 'labelTabs' : 'labelTab'
          )}`
        }}
      >
        <IconButton icon="tab" class="text-sm" role="img" />
        {session?.tabsNumber}
      </div>

      {#if session?.dateSaved}
        <div
          class="session-card"
          use:tooltip={{
            title: `${i18n.getMessage('labelSavedAt')} ${new Date(
              session.dateSaved
            ).toLocaleString(navigator.language, {
              dateStyle: 'short',
              timeStyle: 'short'
            })}`
          }}
        >
          <IconButton icon="history" class="text-sm" role="img" />
          {getRelativeTime(session.dateSaved)}
        </div>
      {/if}

      {#if session.tags}
        {@const tag = $settings.tags[session.tags]}
        <Tag
          name={session.tags}
          bgColor={tag?.bgColor}
          textColor={tag?.textColor}
          class="ml-auto"
        />
      {/if}
    </div>
  </button>
</li>

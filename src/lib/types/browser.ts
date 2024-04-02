import browser from 'webextension-polyfill';

export interface EWindow extends browser.Windows.Window {
  title: string;
}

export type EDragWindow = DragEvent & {
  currentTarget: EventTarget & HTMLLIElement;
};

export type ETab = browser.Tabs.Tab;
export type QueryInfo = browser.Tabs.QueryQueryInfoType;
export type compressOptions = {
  type?: 'image/webp' | 'image/jpeg' | 'image/png';
  quality?: number;
  max_size?: number;
};

import type { UUID } from 'crypto';
import type { EWindow } from './browser';

export interface ESession {
	title: string;
	windows: EWindow[];
	tabsNumber: number;
	dateSaved: number | undefined;
	dateModified: number | undefined;
	id: UUID | 'current';
}

export interface FilterOptions {
	query: string;
	default_tabs?: boolean;
}

export type Page = 'popup' | 'options';

export type URLFilterList = string[] | ['<all_urls>'];

export type Icon =
	| 'default'
	| 'copy'
	| 'check'
	| 'save'
	| 'rename'
	| 'delete'
	| 'open'
	| 'close'
	| 'incognito'
	| 'window'
	| 'tab'
	| 'expand'
	| 'collapse'
	| 'search'
	| 'light'
	| 'dark'
	| 'options'
	| 'donate';

export interface ENotification {
	type: 'info' | 'success' | 'warning' | 'error';
	msg: string;
	duration?: number;
}

export interface ESettings {
	darkMode: boolean;
	popupView: boolean;
	selectionId: 'current' | UUID;
	discarded: boolean;
	urlFilterList: URLFilterList;
}
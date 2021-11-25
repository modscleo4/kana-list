'use strict';

import * as Vue from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.0/vue.esm-browser.prod.js';

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

/**
 * Install the service worker
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, err => {
            console.error('ServiceWorker registration failed: ', err);
        });
    });
}

window.addEventListener('appinstalled', () => {
    console.log('A2HS installed');
});

const app = Vue.createApp({
    data: () => ({
        sidebarOpened: false,
        search: '',
        standalone: window.matchMedia('(display-mode: standalone)').matches,
        config: {
            get theme() {
                return localStorage.getItem('theme') ?? 'system';
            },

            set theme(val) {
                localStorage.setItem('theme', val);
                document.querySelector('html').setAttribute('theme', val);
            },

            get kanaType() {
                return localStorage.getItem('kanaType') ?? 'hiragana';
            },

            set kanaType(val) {
                localStorage.setItem('kanaType', val);
                document.title = roumaji2kana(val);
            },

            get useMarks() {
                return (localStorage.getItem('useMarks') ?? true) === 'true';
            },

            set useMarks(val) {
                localStorage.setItem('useMarks', val);
            },

            get showYouon() {
                return (localStorage.getItem('showYouon') ?? false) === 'true';
            },

            set showYouon(val) {
                localStorage.setItem('showYouon', val);
            },

            get showSokuon() {
                return (localStorage.getItem('showSokuon') ?? false) === 'true';
            },

            set showSokuon(val) {
                localStorage.setItem('showSokuon', val);
            },

            get showTokushuon() {
                return (localStorage.getItem('showTokushuon') ?? false) === 'true';
            },

            set showTokushuon(val) {
                localStorage.setItem('showTokushuon', val);
            },
        },
        popupKana: {
            hiragana: null,
            katakana: null,
            roumaji: null,
            ipa: null,
            combination: [],
        },
    }),

    computed: {

    },

    methods: {

    },
}).mount('#app');

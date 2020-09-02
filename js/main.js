'use strict';

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

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

window.addEventListener('appinstalled', (e) => {
    console.log('A2HS installed');
});

Vue.component('card', {
    props: ['kana', 'kanaType'],

    template: `
<div class="card" :class="{'combination': kana[kanaType].length > 1}" data-toggle="modal" data-target="#kanaModal">
    <span class="kana">{{ kana[kanaType] }}</span>
    <span class="roumaji">{{ kana.roumaji }}</span>
</div>`,
});

let app;

/**
 * @type {{seion: {hiragana: String, roumaji: String, ipa: String, combination: String[]?}[], youon: {hiragana: String, roumaji: String, ipa: String}[], sokuon: {hiragana: String, roumaji: String, ipa: String}[]}}
 */
let kanaTable = {};
fetch('./js/kana-list.json').then(response => response.json()).then(data => kanaTable = data).then(() => {
    app = new Vue({
        el: '#app',
        data: {
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
                    return localStorage.getItem('useMarks') === 'true' ?? false;
                },

                set useMarks(val) {
                    localStorage.setItem('useMarks', val);
                },

                get showYouon() {
                    return localStorage.getItem('showYouon') === 'true' ?? true;
                },

                set showYouon(val) {
                    localStorage.setItem('showYouon', val);
                },

                get showSokuon() {
                    return localStorage.getItem('showSokuon') === 'true' ?? true;
                },

                set showSokuon(val) {
                    localStorage.setItem('showSokuon', val);
                },
            },
            kana: {},
        },
        computed: {
            kanasFiltered: function () {
                const kanas = [...kanaTable.seion];
                this.config.showYouon && kanas.push(...kanaTable.youon);
                this.config.showSokuon && kanas.push(...kanaTable.sokuon);

                return kanas.filter(kana => kana.roumaji.includes(this.search.toLowerCase()));
            },
        },
        methods: {
            popup: function (kana) {
                this.kana = kana;
            },
        }
    });

    document.title = roumaji2kana(app.config.kanaType);
});

function isVowel(char) {
    return ['a', 'e', 'i', 'o', 'u'].includes(char.toLowerCase());
}

function roumaji2kana(str) {
    const words = str.toLowerCase().split(' ');
    const kanasTable = [...kanaTable.seion, ...kanaTable.youon, ...kanaTable.sokuon];
    const kanas = words.map(word => {
        let kana = '';
        let lastKana = null;
        let toFind = word;
        while (toFind.length > 0) {
            const found = kanasTable.find(h => toFind.startsWith(h.roumaji));

            if (!found) {
                kana = word;
                break;
            }

            if (app.config.kanaType === 'katakana' && lastKana && isVowel(toFind[0]) && toFind[0] === lastKana.roumaji[lastKana.roumaji.length - 1]) {
                kana += 'ー';
                toFind = toFind.slice(1);
                continue;
            }

            if (app.config.kanaType === 'hiragana' && word === 'wa') {
                kana += 'は';
                break;
            }

            if (app.config.useMarks) {
                if (found.combination && lastKana && (found === lastKana || found.combination[app.config.kanaType][0] === lastKana[app.config.kanaType])) {
                    kana += app.config.kanaType === 'hiragana' ? 'ゞ' : 'ヾ';
                    toFind = toFind.slice(found.roumaji.length);
                    continue;
                }

                if (found === lastKana) {
                    kana += app.config.kanaType === 'hiragana' ? 'ゝ' : 'ヽ';
                    toFind = toFind.slice(found.roumaji.length);
                    continue;
                }
            }

            lastKana = found;
            kana += found[app.config.kanaType];
            toFind = toFind.slice(found.roumaji.length);
        }

        return kana;
    });

    return kanas.join('');
}

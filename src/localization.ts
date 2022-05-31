export enum Translate {
    hello
}

const localizations = {
    [Translate.hello]: {
        en: 'Hello',
        ru: 'Привет',
        ua: 'Привiт'
    }
}

export type Languages = 'en' | 'ru' | 'ua';

export class Localization {

    constructor(
        private language: Languages
    ) {
        this.translate = this.translate.bind(this);
    }

    translate(locale: Translate, language: Languages = this.language): string {
        if (locale in localizations) {
            const dict = localizations[locale];
            if (language in dict) {
                return dict[language];
            }
        }
    
        return Translate[locale];
    }
}
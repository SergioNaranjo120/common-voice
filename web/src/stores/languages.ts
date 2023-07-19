import { Dispatch } from 'redux';
import StateTree from '../stores/tree';

type Locales = string[];

interface NativeNames {
  [property: string]: string;
}

export interface State {
  isLoading: boolean;
  allLocales?: Locales;
  contributableLocales?: Locales;
  nativeNames?: NativeNames;
  rtlLocales?: Locales;
  translatedLocales?: Locales;
  contributableNativeNames?: NativeNames;
}

enum ActionType {
  LOADED = 'LOADED',
}

interface LoadedAction {
  type: ActionType.LOADED;
  payload: {
    allLocales: Locales;
    contributableLocales: Locales;
    nativeNames: NativeNames;
    rtlLocales: Locales;
    translatedLocales: Locales;
    contributableNativeNames: NativeNames;
  };
}

export type Action = LoadedAction;

export const actions = {
  loadLocalesData: () => {
    return async (
      dispatch: Dispatch<LoadedAction>,
      getState: () => StateTree
    ) => {
      const { api } = getState();
      const allLanguages1 = await api.fetchAllLanguages();

      //Filtrar para mostrar solo espa;ol
      const allLanguages = allLanguages1.filter(language => language.name === 'es' || language.name === 'en');

      //get obj of native names, default to language code
      const nativeNames = allLanguages.reduce((names: any, language) => {
        names[language.name] = language.native_name ?? language.name;
        return names;
      }, {});

      //Hacer que el nombre nativo de en sea es para que redirija a espa;ol
      nativeNames['en'] = 'es';

      const contributableNativeNames = allLanguages.reduce(
        (names: Record<string, string>, language) => {
          if (language.is_contributable) {
            names[language.name] = language.native_name ?? language.name;
          }
          return names;
        },
        {}
      );

      //get array of rtl languages
      const rtlLocales = allLanguages.reduce((names: any, language) => {
        if (language.text_direction === 'RTL') {
          names.push(language.name);
        }
        return names;
      }, []);

      const translatedLocales = allLanguages.reduce((names: any, language) => {
        if (language.is_translated) {
          names.push(language.name);
        }
        return names;
      }, []);

      const allLocales = allLanguages.map(language => language.name);
      const contributableLocales = allLanguages
        .filter(language => language.is_contributable)
        .map(language => language.name);

      dispatch({
        type: ActionType.LOADED,
        payload: {
          allLocales,
          contributableLocales,
          nativeNames,
          rtlLocales,
          translatedLocales,
          contributableNativeNames,
        },
      });
    };
  },
};

const INITIAL_STATE = {
  isLoading: true,
};

export function reducer(state: State = INITIAL_STATE, action: Action): State {
  switch (action.type) {
    case ActionType.LOADED:
      return {
        ...state,
        isLoading: false,
        allLocales: action.payload.allLocales,
        contributableLocales: action.payload.contributableLocales,
        nativeNames: action.payload.nativeNames,
        rtlLocales: action.payload.rtlLocales,
        translatedLocales: action.payload.translatedLocales,
        contributableNativeNames: action.payload.contributableNativeNames,
      };

    default:
      return state;
  }
}

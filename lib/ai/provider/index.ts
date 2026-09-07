import { AldanLanguageModel, type AldanModelSettings } from "./aldan-language-model";

export interface AldanProvider {
  (modelId?: string, settings?: AldanModelSettings): AldanLanguageModel;
  languageModel(modelId?: string, settings?: AldanModelSettings): AldanLanguageModel;
}

export function createAldan(defaultSettings: AldanModelSettings = {}): AldanProvider {
  const createModel = (
    modelId = "aldan-stateful-v1",
    settings: AldanModelSettings = {}
  ) => {
    return new AldanLanguageModel(modelId, {
      ...defaultSettings,
      ...settings,
    });
  };

  const provider = function (modelId?: string, settings?: AldanModelSettings) {
    return createModel(modelId, settings);
  } as AldanProvider;

  provider.languageModel = createModel;

  return provider;
}

export const aldan = createAldan();
export { AldanLanguageModel };

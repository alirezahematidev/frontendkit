import { UserConfig } from 'vite';
import { getAlias } from './alias';
import { resolve } from 'node:path';

const overrideViteConfig = <C extends object>(config: C): UserConfig => {
  const { rootName, cwd } = getAlias();

  const customConfig = {
    resolve: {
      alias: {
        [`@${rootName}/components`]: resolve(cwd, 'src/components'),
      },
    },
  };

  const mergedConfig: UserConfig = Object.assign({}, config, customConfig);

  return mergedConfig;
};

export { overrideViteConfig };

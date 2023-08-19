import { basename, dirname, resolve } from 'node:path';

export const getAlias = () => {
  const tsConfigPath = resolve(process.cwd(), 'tsconfig.json');

  const cwd = dirname(tsConfigPath);

  const rootName = basename(cwd);

  return { tsConfigPath, cwd, rootName };
};

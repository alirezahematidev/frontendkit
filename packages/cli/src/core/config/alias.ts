import { basename, dirname, resolve } from 'node:path';

export const getAlias = (output: string | undefined) => {
  const _path = output ? resolve(process.cwd(), output, 'tsconfig.json') : resolve(process.cwd(), 'tsconfig.json');

  const cwd = dirname(_path);

  const rootName = basename(cwd);

  return { tsConfigPath: _path, cwd, rootName };
};

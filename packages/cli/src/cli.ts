import { resolve } from 'node:path';
import * as fs from 'node:fs/promises';
import glob from 'fast-glob';
import { pathToFileURL } from 'node:url';
import { FrontkitConfiguration } from '../types/configs';

// const DEFAULT_SOURCE = 'src';

// const DEFAULT_OUT = 'frontend';

// frontkit.config.js

const absolutePath = (...paths: string[]) => resolve(process.cwd(), ...paths);

const tsConfigPath = resolve(process.cwd(), 'tsconfig.json');

async function getFrontendkitConfigFile() {
  try {
    const [pickableFile, ...files] = await glob.async('frontkit.config.{json,js,ts,mjs,cjs}', { absolute: true });

    if (!pickableFile) return;

    if (files.length) {
      // console.log('Multiple config file paths found. we automatically pick first one: %s', pickableFile);
    } else {
      // console.log('A config file path found: %s', pickableFile);
    }

    return pickableFile;
  } catch (error) {
    //
  }
}

async function revalidateTsConfig() {
  try {
    await fs.access(tsConfigPath, fs.constants.O_RDWR);

    const buf = await fs.readFile(tsConfigPath);

    const config = JSON.parse(buf.toString());

    config.include = [...(config.include || []), 'src/frontend/**/*'];

    const prettier = await import('prettier');

    const options = await prettier.resolveConfig(tsConfigPath);

    const formattedConfig = await prettier.format(JSON.stringify(config), { ...options, parser: 'json' });

    await fs.writeFile(tsConfigPath, formattedConfig);
  } catch (error) {
    //
  }
}

async function executeCommand() {
  const frontkitConfigFile = await getFrontendkitConfigFile();

  const content: FrontkitConfiguration | undefined = frontkitConfigFile
    ? (await import(pathToFileURL(frontkitConfigFile).toString())).default
    : undefined;

  const paths = content && content.output ? content.output.split('/') : ['src', 'frontend'];

  try {
    await fs.access(absolutePath(...paths), fs.constants.R_OK);
  } catch (error) {
    await fs.mkdir(absolutePath(...paths));
  }

  try {
    await fs.access(absolutePath(...paths, 'components'), fs.constants.R_OK);
  } catch (error) {
    await fs.mkdir(absolutePath(...paths, 'components'));
  }

  await revalidateTsConfig();
}

executeCommand().catch(console.error);

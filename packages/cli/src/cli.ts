import * as fs from 'node:fs/promises';
import { Command } from 'commander';
import select from '@inquirer/select';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import glob from 'fast-glob';
import fsExtra from 'fs-extra';
import { getAlias } from './core/config/alias';

type Options = {
  scope?: string;
};

const program = new Command();

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const absolutePath = (...paths: string[]) => resolve(process.cwd(), ...paths);

async function getFrontendkitConfigFile() {
  try {
    const [pickableFile, ...files] = await glob.async('kit.config.json', { absolute: true });

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
    const { rootName, tsConfigPath } = getAlias();

    await fs.access(tsConfigPath, fs.constants.O_RDWR);

    const buf = await fs.readFile(tsConfigPath);

    const config = JSON.parse(buf.toString());

    const kitIncludes = 'src/components/**/*';

    if (!(config.include || []).includes(kitIncludes)) {
      config.include = [...(config.include || []), kitIncludes];
    }

    config.compilerOptions = config.compilerOptions ?? {};

    config.compilerOptions.baseUrl = '.';

    const aliasPaths = { [`@${rootName}/components`]: ['src/components'] };

    config.compilerOptions.paths = { ...config.paths, ...aliasPaths };

    const prettier = await import('prettier');

    const options = await prettier.resolveConfig(tsConfigPath);

    const formattedConfig = await prettier.format(JSON.stringify(config), { ...options, parser: 'json' });

    await fs.writeFile(tsConfigPath, formattedConfig);
  } catch (error) {
    //
  }
}

const basePath = resolve(__dirname, '../../components/src/core');

async function copyDirectory(component: string, source: string, destination: string) {
  try {
    await fsExtra.copy(source, destination);
    console.log(`${component} component is successfully generated`);
  } catch (error) {
    console.error(`Error copying ${component} component:`, error);
  }
}

function componentExportStatement(name: string) {
  return `export * from "./${name}";\n`;
}

async function generateComponent(component: string, scope?: string) {
  const frontkitConfigFile = await getFrontendkitConfigFile();

  const buf = frontkitConfigFile ? await fs.readFile(frontkitConfigFile) : undefined;

  const content = buf ? JSON.parse(buf.toString()) : undefined;

  const scopeConfig = scope ? content[scope] : content;

  const paths = scopeConfig && scopeConfig.output && typeof scopeConfig.output === 'string' ? scopeConfig.output.split('/') : ['src', 'components'];

  const componentsFolder = absolutePath(...paths);

  try {
    await fsExtra.ensureDir(componentsFolder);
  } catch (error) {
    //
  }

  const root = resolve(componentsFolder, 'index.ts');

  try {
    await fsExtra.ensureFile(root);
  } catch (error) {
    //
  }

  const source = resolve(basePath, component);

  const destination = resolve(componentsFolder, component);

  await Promise.all([copyDirectory(component, source, destination), revalidateTsConfig()]);

  const rootContent = await fsExtra.readFile(root, { encoding: 'utf8' });

  const regex = /export \* from ['"]\.\/(\w+)['"];/gm;

  const chunks = rootContent.split('\n');

  const matches = chunks.map((chunk) => {
    const exec = regex.exec(chunk) || [];

    chunk.match(regex);

    return exec[1];
  });

  const uniqueMatches = [...new Set(matches)].filter(Boolean);

  if (!uniqueMatches.includes(component)) {
    await fsExtra.appendFile(root, componentExportStatement(component));
  }
}

// executeCommand().catch(console.error);

type ComponentEntry = {
  name: string;
  value: string;
};

function capitalize(name: string): string {
  return name.slice(0, 1).toUpperCase() + name.slice(1);
}

function toComponentEntry(entry: string): ComponentEntry {
  return {
    value: entry,
    name: capitalize(entry),
  };
}

function validateDirectory(dir: string | undefined): dir is string {
  return Boolean(dir);
}

function getComponentValue(componentEntry: ComponentEntry) {
  return componentEntry.value;
}

async function getComponentFiles(): Promise<ComponentEntry[]> {
  const files = await fs.readdir(basePath);

  const directories = files.map(async (file) => {
    const filePath = resolve(basePath, file);

    const stats = await fs.lstat(filePath);

    if (stats.isDirectory()) return file;
  });

  const promisifies = await Promise.all(directories);

  const entries = promisifies.filter(validateDirectory);

  const components: ComponentEntry[] = entries.map(toComponentEntry);

  return components;
}

program
  .command('generate [component]')
  .description('generate a component')
  .option('-s, --scope <string>', 'generate for specific scope')
  .action(async (component: string | undefined, { scope }: Options = {}) => {
    const components = await getComponentFiles();

    if (component) {
      const componentValues = components.map(getComponentValue);

      if (component === '*') {
        await Promise.all(componentValues.map(async (value) => await generateComponent(value, scope)));

        process.exit(0);
      }

      if (!componentValues.includes(component)) {
        console.log(`${component} does not exists. pick another available component`);
        process.exit(1);
      }

      return await generateComponent(component, scope);
    }

    const answer = await select({
      message: 'pick a component',
      choices: components,
    });

    await generateComponent(answer, scope);
  });

program.parse(process.argv);

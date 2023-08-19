import { release } from '@vitejs/release-scripts';
import { logRecentCommits, run } from './releaseUtils';

release({
  repo: 'frontendkit',
  packages: ['components', 'utilities', 'cli'],
  toTag: (pkg, version) => `${pkg}@${version}`,
  logChangelog: logRecentCommits,
  generateChangelog: async (pkgName) => {
    try {
      const args = ['--lerna-package', `@frontendkit/${pkgName}`];

      await run('npx', args, { cwd: `packages/${pkgName}` });
    } catch (error) {
      console.log(error);
    }
  },
});

import type { Options as ExecaOptions, ExecaReturnValue } from 'execa'
import { execa } from 'execa'

export async function run(bin: string, args: string[], opts: ExecaOptions<string> = {}): Promise<ExecaReturnValue<string>> {
  return execa(bin, args, { stdio: 'inherit', ...opts })
}

export async function getLatestTag(pkgName: string): Promise<string> {
  const tags = (await run('git', ['tag'], { stdio: 'pipe' })).stdout.split(/\n/).filter(Boolean)

  return tags
    .filter((tag) => tag.startsWith(`${pkgName}@`))
    .sort()
    .reverse()[0]
}

export async function logRecentCommits(pkgName: string): Promise<void> {
  const tag = await getLatestTag(pkgName)
  if (!tag) return
  const sha = await run('git', ['rev-list', '-n', '1', tag], {
    stdio: 'pipe',
  }).then((res) => res.stdout.trim())
  await run('git', ['--no-pager', 'log', `${sha}..HEAD`, '--oneline', '--', `packages/${pkgName}`], {
    stdio: 'inherit',
  })
}

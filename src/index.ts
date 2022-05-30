import { spawnSync } from 'child_process'
import { getRunner } from './runner'

interface RunOptions {
  testsToRun?: string[]
}

function run(framework: string, { testsToRun = [] }: RunOptions) {
  const runner = getRunner(framework)
  const { executable } = runner
  const args = runner.build({ testsToRun })
  console.error(
    `Running tests for ${framework}:`,
    [executable].concat(args).join(' '),
  )
  try {
    const { status } = spawnSync(executable, args, { stdio: 'inherit' })
    console.error('Done.')
    process.exit(status ?? 1)
  } catch (e) {
    console.error('Failed to run tests.')
    process.exit(1)
  }
}

export default run

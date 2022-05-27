import { spawnSync } from 'child_process'

function run(args: unknown[]) {
  spawnSync('echo', ['Hello'].concat(args.map(String)), { stdio: 'inherit' })
}

export default run

import path from 'path'
import log from './log'

export interface AdapterInput {
  testNamesToRun?: string[]
}

export interface AdapterOutput {
  exitCode: number
}

export interface Adapter {
  executeTests(options: AdapterInput): Promise<AdapterOutput> | AdapterOutput
}

export function loadAdapter(adapterModule: string): Promise<Adapter> {
  return import(adapterModule)
    .catch(() => import(path.resolve(process.cwd(), adapterModule)))
    .then((adapter) => {
      log.stderr('Loaded adapter from', adapterModule)
      return adapter
    })
}

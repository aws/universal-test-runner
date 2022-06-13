import log from './log'

export interface AdapterInput {
  testNamesToRun?: string[]
}

export interface AdapterOutput {
  exitCode?: number | null
}

export interface Adapter {
  executeTests(options: AdapterInput): Promise<AdapterOutput> | AdapterOutput
}

export async function loadAdapter(adapterModule: string): Promise<Adapter> {
  try {
    const adapter = await import(adapterModule)
    log.stderr('Loaded adapter from', adapterModule)
    return adapter
  } catch (e) {
    log.stderr('Failed to load adapter from', adapterModule)
    throw e
  }
}

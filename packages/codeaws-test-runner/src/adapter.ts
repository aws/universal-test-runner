export interface AdapterInput {
  testNamesToRun?: string[]
}

export interface AdapterOutput {
  exitCode: number
}

export interface Adapter {
  executeTests(options: {
    testNamesToRun?: string[]
  }): Promise<AdapterOutput> | AdapterOutput
}

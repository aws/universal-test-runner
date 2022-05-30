interface RunnerOptions {
  testsToRun: string[]
}

export interface Runner {
  executable: string
  build(options: RunnerOptions): string[]
}

export function getRunner(framework: string) {
  switch (framework) {
    case 'jest':
      return new JestRunner()
    case 'junit':
      return new JunitRunner()
    default:
      throw new Error(`Unknown framework ${framework}`)
  }
}

class JestRunner implements Runner {
  get executable() {
    return './node_modules/.bin/jest'
  }

  build({ testsToRun }: RunnerOptions): string[] {
    if (testsToRun.length === 0) {
      return []
    }
    return ['-t', testsToRun.join('|')]
  }
}

class JunitRunner implements Runner {
  get executable() {
    return 'echo'
  }

  build(): string[] {
    return ['Junit not implemented yet']
  }
}

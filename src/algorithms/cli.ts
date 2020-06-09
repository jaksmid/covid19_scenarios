import { readJSON, writeJSON } from 'fs-extra'
import yargs from 'yargs'
import { inspect } from 'util'

import type { Shareable, ScenarioFlat } from './types/Param.types'
import type { AlgorithmResult } from './types/Result.types'
import { toInternal } from './types/convert'
import { run } from './run'

async function main() {
  const { argv } = yargs
    .options({
      scenario: { type: 'string', demandOption: true, describe: 'Path to scenario parameters JSON file.' },
      out: { type: 'string', demandOption: true, describe: 'Path to output file.' },
    })
    .help()
    .version(false)
    .alias('h', 'help')

  const data: Shareable = await readJSON(argv.scenario)
  const { scenarioData, ageDistributionData, severityDistributionData } = data

  const scenario = toInternal(scenarioData.data)

  const params: ScenarioFlat = {
    ...scenario.population,
    ...scenario.epidemiological,
    ...scenario.simulation,
    ...scenario.mitigation,
  }

  const severity = severityDistributionData.data

  const ageDistribution = ageDistributionData.data

  const result: AlgorithmResult = await run({ params, severity, ageDistribution })

  const whatToWrite = result.R0
  console.info(inspect(whatToWrite, { colors: true, depth: null }))
  writeJSON(argv.out, whatToWrite, { spaces: 2 })
}

main()

import { Command } from 'commander'
import Pick from './pick'
import Replace from './replace'
import Search from './search'
import ToExcel from './toexcel'
import Transform from './transform'

export default function run(program: Command): void {
  ;[Pick, Replace, Search, ToExcel, Transform].forEach((command) =>
    command(program)
  )
}

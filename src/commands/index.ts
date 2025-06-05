import { Command } from 'commander'
import Pick from './pick'
import Replace from './replace'
import Search from './search'
import ToExcel from './toexcel'

export default function run(program: Command): void {
  ;[Pick, Replace, Search, ToExcel].forEach((command) => command(program))
}

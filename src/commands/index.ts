import { Command } from 'commander'
import Pick from './pick'
import Replace from './replace'
import Search from './search'

export default function run(program: Command): void {
  ;[Pick, Replace, Search].forEach((command) => command(program))
}

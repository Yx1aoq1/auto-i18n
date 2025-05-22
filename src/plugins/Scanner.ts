export class Scanner {
  pos: number = 0
  tail: string = ''
  keyword: string | null = null
  constructor(public readonly templateStr: string) {
    this.tail = templateStr
  }

  scan() {
    if (this.keyword && this.tail.indexOf(this.keyword) === 0) {
      this.pos += this.keyword.length
      this.tail = this.templateStr.substring(this.pos)
    }
  }

  scanUtil(stopTag: string | string[] | null): string {
    if (Array.isArray(stopTag)) {
      this.keyword = this.findNearestKeyword(stopTag)
      return this.scanUtil(this.keyword)
    }
    this.keyword = stopTag
    const pos_backup = this.pos
    while (!this.eos() && (!stopTag || this.tail.indexOf(stopTag) !== 0)) {
      this.pos++
      this.tail = this.templateStr.substring(this.pos)
    }
    return this.templateStr.substring(pos_backup, this.pos)
  }

  eos() {
    return this.pos >= this.templateStr.length
  }

  findKeywordPos(keyword: string | null) {
    if (typeof keyword === 'string') {
      return this.tail.indexOf(keyword)
    }
    return this.pos
  }

  findNearestKeyword(keys: string[]): string | null {
    if (!keys.length) return null
    let nearest: string | null = null
    let min = Infinity
    keys.forEach((keyword) => {
      const pos = this.findKeywordPos(keyword)
      if (pos !== -1 && pos < min) {
        min = pos
        nearest = keyword
      }
    })
    return nearest
  }
}

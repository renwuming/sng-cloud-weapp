interface Match {
  _id: string
  name: string
  updateTime: number
  sumTime: number
  levelList: Level[]
  start: boolean
  startTime: Date
  end: boolean
  currentLevel: Level
  nextLevel: Level
  timer: number
  currentLevelIndex: number
}

interface Level {
  level: number
  sb: number
  bb: number
  ante: number
}

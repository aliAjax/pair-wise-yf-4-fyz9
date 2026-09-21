import type { WindowScene } from '@/types'

/** 判定一条记录是否为重点；缺标记字段的旧记录按普通记录处理 */
export function isStarredScene(scene: WindowScene): boolean {
  return scene.isStarred === true
}

/** 按记录时间倒序排列（新的在前），不改变原数组 */
export function sortByTimeDesc(scenes: WindowScene[]): WindowScene[] {
  return [...scenes].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}

/** 取出排序后的全部线路名 */
export function collectRouteNames(scenes: WindowScene[]): string[] {
  return Array.from(new Set(scenes.map((s) => s.routeName))).sort()
}

export interface SceneFilter {
  /** 选中的线路；为空表示不限线路 */
  routeName?: string
  /** 是否只看重点 */
  onlyStarred?: boolean
}

/**
 * 线路条件与「只看重点」同时生效：两个条件都满足才会留下。
 * 清空线路后重点条件仍然保留。
 */
export function filterScenes(scenes: WindowScene[], filter: SceneFilter): WindowScene[] {
  return scenes.filter((scene) => {
    if (filter.routeName && scene.routeName !== filter.routeName) return false
    if (filter.onlyStarred && !isStarredScene(scene)) return false
    return true
  })
}

/**
 * 灵感抽取：优先从重点记录里随机取；
 * 没有任何重点记录时才回到全部记录。无记录返回 null。
 */
export function pickRandomScene(scenes: WindowScene[]): WindowScene | null {
  if (scenes.length === 0) return null
  const pool = scenes.filter(isStarredScene)
  const candidates = pool.length > 0 ? pool : scenes
  return candidates[Math.floor(Math.random() * candidates.length)]
}

import type { WindowScene } from '@/types'

/** 旧记录缺少 isHighlight 字段时按普通记录处理 */
export function isHighlightScene(scene: WindowScene): boolean {
  return scene.isHighlight === true
}

/** 按时间倒序 */
export function sortByTimeDesc(scenes: WindowScene[]): WindowScene[] {
  return [...scenes].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}

/**
 * 时间线筛选规则：线路条件与"只看重点"同时生效（取交集）。
 * routeName 为空表示不限制线路。
 */
export function filterScenes(
  scenes: WindowScene[],
  routeName: string,
  highlightOnly: boolean
): WindowScene[] {
  const byRoute = routeName ? scenes.filter((s) => s.routeName === routeName) : scenes
  const byHighlight = highlightOnly ? byRoute.filter(isHighlightScene) : byRoute
  return sortByTimeDesc(byHighlight)
}

/** 所有线路名，字母/拼音排序由调用方数据自然排序 */
export function getRouteNames(scenes: WindowScene[]): string[] {
  return Array.from(new Set(scenes.map((s) => s.routeName))).sort()
}

/**
 * 灵感抽取规则：只从重点记录里随机取；没有重点时才回到全部记录。
 * 无记录时返回 null。
 */
export function pickRandomScene(scenes: WindowScene[]): WindowScene | null {
  if (scenes.length === 0) return null
  const pool = scenes.filter(isHighlightScene)
  const source = pool.length > 0 ? pool : scenes
  return source[Math.floor(Math.random() * source.length)]
}

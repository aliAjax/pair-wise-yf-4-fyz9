import type { WindowScene } from '@/types'

const STORAGE_KEY = 'bus_window_scenes'

/**
 * 读取并归一化：旧记录缺少 isHighlight 字段时按普通记录处理，
 * 同时把归一化结果写回，避免每次读取都出现缺字段的数据。
 */
export function getAllScenes(): WindowScene[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    let hasLegacy = false
    const scenes = parsed.map((s: WindowScene) => {
      if (s.isHighlight !== true) {
        hasLegacy = true
        return { ...s, isHighlight: false }
      }
      return s
    })

    if (hasLegacy) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scenes))
    }
    return scenes
  } catch {
    return []
  }
}

function writeAll(scenes: WindowScene[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenes))
}

export function saveScene(scene: WindowScene): void {
  const scenes = getAllScenes()
  scenes.push(scene)
  writeAll(scenes)
}

export function deleteScene(id: string): void {
  const scenes = getAllScenes().filter((s) => s.id !== id)
  writeAll(scenes)
}

/** 切换重点标记并持久化，返回更新后的全部记录 */
export function updateScene(id: string, patch: Partial<WindowScene>): WindowScene[] {
  const scenes = getAllScenes().map((s) =>
    s.id === id ? { ...s, ...patch } : s
  )
  writeAll(scenes)
  return scenes
}

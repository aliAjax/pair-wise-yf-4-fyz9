import type { WindowScene } from '@/types'

const STORAGE_KEY = 'bus_window_scenes'

/** 读取全部记录；存储异常或缺字段时不影响应用运行 */
export function getAllScenes(): WindowScene[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is WindowScene =>
        typeof item === 'object' && item !== null && 'id' in item
    )
  } catch {
    return []
  }
}

function persist(scenes: WindowScene[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenes))
}

/** 追加一条新记录（标记随记录一起写入本地） */
export function saveScene(scene: WindowScene): void {
  persist([...getAllScenes(), scene])
}

/** 删除一条记录 */
export function deleteScene(id: string): void {
  persist(getAllScenes().filter((s) => s.id !== id))
}

/** 更新一条记录的重点标记，刷新页面后仍然保持 */
export function setSceneStarred(id: string, starred: boolean): WindowScene | null {
  const scenes = getAllScenes()
  const index = scenes.findIndex((s) => s.id === id)
  if (index === -1) return null
  const updated: WindowScene = { ...scenes[index], isStarred: starred }
  scenes[index] = updated
  persist(scenes)
  return updated
}

import { create } from 'zustand'
import type { WindowScene, SceneFormData } from '@/types'
import {
  getAllScenes,
  saveScene as storageSaveScene,
  deleteScene as storageDeleteScene,
  updateScene as storageUpdateScene,
} from '@/services/storage'
import { getRouteNames, pickRandomScene } from '@/utils/sceneRules'

interface SceneState {
  scenes: WindowScene[]
  routeNames: string[]
  selectedRoute: string
  /** "只看重点"筛选开关：清空线路后仍保留 */
  highlightOnly: boolean
  randomScene: WindowScene | null

  loadAll: () => void
  saveScene: (data: SceneFormData) => void
  deleteScene: (id: string) => void
  toggleHighlight: (id: string) => void
  selectRoute: (routeName: string) => void
  toggleHighlightOnly: () => void
  setHighlightOnly: (value: boolean) => void
  refreshRandom: () => void
}

export const useSceneStore = create<SceneState>((set, get) => ({
  scenes: [],
  routeNames: [],
  selectedRoute: '',
  highlightOnly: false,
  randomScene: null,

  loadAll: () => {
    const scenes = getAllScenes()
    set({ scenes, routeNames: getRouteNames(scenes) })
  },

  saveScene: (data: SceneFormData) => {
    const scene: WindowScene = {
      ...data,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      isHighlight: false,
    }
    storageSaveScene(scene)
    const scenes = getAllScenes()
    set({ scenes, routeNames: getRouteNames(scenes) })
  },

  deleteScene: (id: string) => {
    storageDeleteScene(id)
    const scenes = getAllScenes()
    // 随机结果若正是被删除的记录，立刻失效，保证各处结果一致
    const randomScene = get().randomScene?.id === id ? null : get().randomScene
    set({ scenes, routeNames: getRouteNames(scenes), randomScene })
  },

  // 标记随记录写入浏览器本地，刷新后由 loadAll 重新读取
  toggleHighlight: (id: string) => {
    const current = get().scenes.find((s) => s.id === id)
    if (!current) return
    const scenes = storageUpdateScene(id, { isHighlight: !current.isHighlight })
    set((state) => ({
      scenes,
      routeNames: getRouteNames(scenes),
      randomScene:
        state.randomScene?.id === id
          ? { ...state.randomScene, isHighlight: !current.isHighlight }
          : state.randomScene,
    }))
  },

  selectRoute: (routeName: string) => {
    // 只清空线路条件，"只看重点"开关保留
    set({ selectedRoute: routeName })
  },

  toggleHighlightOnly: () => set((state) => ({ highlightOnly: !state.highlightOnly })),

  setHighlightOnly: (value: boolean) => set({ highlightOnly: value }),

  refreshRandom: () => {
    // 抽取规则在规则层：优先重点池，无重点才回退全部
    set({ randomScene: pickRandomScene(get().scenes) })
  },
}))

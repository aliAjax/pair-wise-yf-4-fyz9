import { create } from 'zustand'
import type { WindowScene, SceneFormData } from '@/types'
import {
  getAllScenes,
  saveScene as storageSaveScene,
  deleteScene as storageDeleteScene,
  setSceneStarred as storageSetSceneStarred,
} from '@/services/storage'
import {
  collectRouteNames,
  pickRandomScene,
} from '@/utils/sceneRules'

interface SceneState {
  scenes: WindowScene[]
  routeNames: string[]
  selectedRoute: string
  onlyStarred: boolean
  randomScene: WindowScene | null

  loadAll: () => void
  saveScene: (data: SceneFormData) => void
  deleteScene: (id: string) => void
  toggleStar: (id: string) => void
  selectRoute: (routeName: string) => void
  toggleOnlyStarred: () => void
  refreshRandom: () => void
}

export const useSceneStore = create<SceneState>((set, get) => {
  // 重新读取本地数据并同步列表/线路名；筛选状态由规则层在页面中承接
  const reload = () => {
    const scenes = getAllScenes()
    const routeNames = collectRouteNames(scenes)
    set({ scenes, routeNames })
  }

  return {
    scenes: [],
    routeNames: [],
    selectedRoute: '',
    onlyStarred: false,
    randomScene: null,

    loadAll: reload,

    saveScene: (data) => {
      const scene: WindowScene = {
        ...data,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        isStarred: false,
      }
      storageSaveScene(scene)
      reload()
    },

    deleteScene: (id) => {
      storageDeleteScene(id)
      reload()
    },

    toggleStar: (id) => {
      const target = get().scenes.find((s) => s.id === id)
      if (!target) return
      const next = !target.isStarred
      const updated = storageSetSceneStarred(id, next)
      if (updated) {
        set((state) => ({
          scenes: state.scenes.map((s) => (s.id === id ? updated : s)),
        }))
      }
    },

    selectRoute: (routeName) => set({ selectedRoute: routeName }),

    // 清空线路只改 selectedRoute，重点开关保持不变
    toggleOnlyStarred: () =>
      set((state) => ({ onlyStarred: !state.onlyStarred })),

    refreshRandom: () => {
      const randomScene = pickRandomScene(get().scenes)
      set({ randomScene })
    },
  }
})

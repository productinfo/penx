import { atom } from 'jotai'
import { isSyncEnabled, SyncStatus } from '@penx/constants'
import { db } from '@penx/local-db'
import { ISpace } from '@penx/model-types'
import { syncFromCloud, syncToCloud } from '@penx/sync'
import { StoreType } from '../store-types'

export const syncStatusAtom = atom<SyncStatus>(SyncStatus.NORMAL)

export class SyncStore {
  constructor(private store: StoreType) {}

  getStatus() {
    return this.store.get(syncStatusAtom)
  }

  setStatus(status: SyncStatus) {
    this.store.set(syncStatusAtom, status)
  }

  pushToCloud = async () => {
    if (!isSyncEnabled) return

    if (!navigator.onLine) return

    const status = this.getStatus()

    if (status === SyncStatus.PUSHING || status === SyncStatus.PULLING) {
      return
    }

    try {
      this.setStatus(SyncStatus.PUSHING)

      const isSynced = await syncToCloud(this.store.user.getMnemonic())

      if (isSynced) {
        // console.log('========isSynced!!!')

        const spaces = await db.listSpaces()
        this.store.space.setSpaces(spaces)
      }

      this.setStatus(SyncStatus.NORMAL)
    } catch (error) {
      this.setStatus(SyncStatus.PUSH_FAILED)
    }
  }

  pullFromCloud = async (space?: ISpace) => {
    const activeSpace = space || this.store.space.getActiveSpace()
    try {
      this.setStatus(SyncStatus.PULLING)

      const mnemonic = this.store.user.getMnemonic()
      await syncFromCloud(activeSpace, mnemonic)

      await this.store.node.selectDailyNote()

      this.setStatus(SyncStatus.NORMAL)
    } catch (error) {
      this.setStatus(SyncStatus.PULL_FAILED)
    }
  }
}

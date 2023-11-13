import { Box } from '@fower/react'
import { useAtom } from 'jotai'
import { CalendarDays, Cloud, Folder, Hash, Inbox, Trash2 } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useNodes } from '@penx/hooks'
import { ExtensionStore, extensionStoreAtom, store } from '@penx/store'
import { FavoriteBox } from './FavoriteBox/FavoriteBox'
import { SidebarItem } from './SidebarItem'
import { SpacePopover } from './SpacePopover'
import { TreeView } from './TreeView/TreeView'
import { UserAvatarModal } from './UserAvatarModal/UserAvatarModal'
import { WalletConnectButton } from './WalletConnectButton'

function getStatusBarComponents(extensionStore: ExtensionStore): any[] {
  const values = Object.values(extensionStore)
  if (!values.length) return []
  return values.reduce((acc, { components = [] }) => {
    const matched = components
      .filter((c) => c.at === 'side_bar')
      .map((c) => c.component)
    return [...acc, ...matched]
  }, [] as any[])
}

export const Sidebar = () => {
  const { isConnected } = useAccount()
  const [extensionStore] = useAtom(extensionStoreAtom)
  const components = getStatusBarComponents(extensionStore)
  const { nodes, nodeList } = useNodes()

  if (!nodes.length) return null

  return (
    <Box
      column
      borderRight
      borderGray100
      flex-1
      display={['none', 'none', 'flex']}
      bgZinc100--T20
      px2
      gap3
      h-100vh
      overflowAuto
      pb2
    >
      <SpacePopover />
      <Box column gap-1 flex-1 pb10>
        <SidebarItem
          icon={<CalendarDays size={16} />}
          label="Daily note"
          onClick={() => {
            store.selectDailyNote()
          }}
        />

        <SidebarItem
          icon={<Inbox size={16} />}
          label="Inbox"
          onClick={() => {
            store.selectInbox()
          }}
        />

        <SidebarItem
          icon={<Hash size={16} />}
          label="Tags"
          onClick={() => {
            store.selectTagBox()
          }}
        />

        <SidebarItem
          icon={<Cloud size={16} />}
          label="Sync"
          onClick={() => {
            store.routeTo('SYNC')
          }}
        />

        {components.map((C, i) => (
          <C key={i} />
        ))}

        <FavoriteBox />

        {!!nodes.length && <TreeView nodeList={nodeList} />}

        {/* <SidebarItem
          icon={<Trash2 size={16} />}
          label="Trash"
          onClick={() => {
            store.selectTrash()
          }}
        /> */}
      </Box>
      <Box>
        {!isConnected && <WalletConnectButton size="lg" w-100p />}
        {isConnected && <UserAvatarModal />}
      </Box>
    </Box>
  )
}

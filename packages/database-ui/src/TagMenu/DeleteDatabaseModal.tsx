import { Box } from '@fower/react'
import {
  Button,
  Modal,
  ModalClose,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useModalContext,
} from 'uikit'
import { ModalNames } from '@penx/constants'
import { db } from '@penx/local-db'
import { IDatabaseNode } from '@penx/model-types'
import { store } from '@penx/store'

const Footer = () => {
  const { data } = useModalContext<IDatabaseNode>()
  async function deleteDatabase() {
    await db.deleteDatabase(data)
    store.node.selectDailyNote()
    close()
  }

  return (
    <Box toCenterY gap3>
      <ModalClose asChild>
        <Button colorScheme="white">Cancel</Button>
      </ModalClose>
      <Button colorScheme="red500" onClick={deleteDatabase}>
        Delete
      </Button>
    </Box>
  )
}

export const DeleteDatabaseModal = () => {
  return (
    <Modal name={ModalNames.DELETE_DATABASE}>
      <ModalOverlay />
      <ModalContent w={['100%', 500]} column gap4 toCenterX>
        <ModalCloseButton />

        <ModalHeader mb2>Are you sure delete it permanently?</ModalHeader>

        <Box>Once deleted, You can't undo this action.</Box>
        <Footer />
      </ModalContent>
    </Modal>
  )
}

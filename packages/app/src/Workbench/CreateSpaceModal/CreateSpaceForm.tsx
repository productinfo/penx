import { Controller } from 'react-hook-form'
import { Box } from '@fower/react'
import { Button, Input, ModalClose, Switch } from 'uikit'
import { ISpace } from '@penx/model-types'
import { BorderedRadioGroup } from './BorderedRadioGroup'
import { SpaceType, useCreateSpaceForm } from './useCreateSpaceForm'

interface Props {
  showCancel?: boolean
  onSpaceCreated?: (space: ISpace) => void
}

export function CreateSpaceForm({ showCancel = true, onSpaceCreated }: Props) {
  const form = useCreateSpaceForm(onSpaceCreated)
  const { control, formState } = form
  const { isValid } = formState

  return (
    <Box as="form" onSubmit={form.onSubmit} column gap4 pt3>
      <Box mb--6>Space Name</Box>
      <Controller
        name="name"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <Input size="lg" placeholder="Name your space" {...field} />
        )}
      />

      <Box mb--6>Type</Box>
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <BorderedRadioGroup
            options={[
              { label: 'Local space', value: SpaceType.LOCAL },
              { label: 'Cloud space', value: SpaceType.CLOUD },
            ]}
            {...field}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Box toCenterY gap2 mt2>
        {showCancel && (
          <ModalClose>
            <Button type="button" size="lg" roundedFull colorScheme="white">
              Cancel
            </Button>
          </ModalClose>
        )}
        <Button type="submit" size="lg" roundedFull disabled={!isValid} gap2>
          Create
        </Button>
      </Box>
    </Box>
  )
}
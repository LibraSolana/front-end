'use client'

import { useMemo, useState } from 'react'
import type { FC } from 'react'
import NiceModal, { useModal as useBaseModal } from '@ebay/nice-modal-react'
import type { NiceModalHandler } from '@ebay/nice-modal-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { atomFamily, atomWithReset, useResetAtom } from 'jotai/utils'
import { useTimeout } from 'usehooks-ts'

// @shared - utils
import { compareId } from '..//utils/state'
import { sleep } from '../utils/datetime'

// state to store modal props
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ModalPropsState = atomFamily(({ id }) => atomWithReset({}), compareId)

export const useModal = (Modal: FC<any>): NiceModalHandler & { setProps: () => void } => {
  // create nice modal interface
  const CustomModal = useMemo(
    () =>
      NiceModal.create(() => {
        // -- base modal state --
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const modal = useBaseModal()

        //  -- modal props --
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const modalProps = useAtomValue(ModalPropsState({ id: modal.id }))
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const resetModalProps = useResetAtom(ModalPropsState({ id: modal.id }))

        // -- delay modal --
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [delay, setDelay] = useState(true)
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useTimeout(() => setDelay(false), 50)

        // -- prepare modal state for shadcn alert --
        const closeModal = async () => {
          modal.hide()
          await sleep(200)
          modal.remove()
          resetModalProps()
        }
        const shadcnModalState = {
          open: delay ? false : modal.visible,
          close: () => closeModal(),
          onOpenChange: (opened: boolean) => {
            if (!opened) {
              closeModal()
            }
          },
          resolve: modal.resolve,
          resolveHide: modal.resolveHide,
          reject: modal.reject,
        }

        return <Modal {...modalProps} modalState={shadcnModalState} />
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  // modal state
  const modal = useBaseModal(CustomModal)
  const setModalProps = useSetAtom(ModalPropsState({ id: modal.id }))

  // override method `modal.show`
  const show = (props = {}) => {
    setModalProps(props)
    return modal.show(props)
  }

  // add method `modal.setProps`
  const setProps = (newProps = {}) => setModalProps((prevProps) => ({ ...prevProps, ...newProps }))

  return { ...modal, show, setProps }
}

export default useModal

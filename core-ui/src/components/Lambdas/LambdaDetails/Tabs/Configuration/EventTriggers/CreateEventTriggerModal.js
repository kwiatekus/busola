import React from 'react';

import { Button } from 'fundamental-react';
import { Tooltip } from 'react-shared';

import ModalWithForm from 'components/ModalWithForm/ModalWithForm';
import CreateEventTriggerForm from 'components/Lambdas/CreateEventTriggerForm/CreateEventTriggerForm';

import { EVENT_TRIGGERS_PANEL } from '../../../../constants';

export default function CreateEventTriggerModal({
  lambda,
  availableEvents = [],
}) {
  const availableEventsExist = availableEvents.length;
  const button = (
    <Button glyph="add" option="light" disabled={!availableEventsExist}>
      {EVENT_TRIGGERS_PANEL.ADD_MODAL.OPEN_BUTTON.TEXT}
    </Button>
  );
  const modalOpeningComponent = availableEventsExist ? (
    button
  ) : (
    <Tooltip
      title={
        EVENT_TRIGGERS_PANEL.ADD_MODAL.OPEN_BUTTON.NOT_ENTRIES_POPUP_MESSAGE
      }
      position="top"
      trigger="mouseenter"
      tippyProps={{
        distance: 16,
      }}
    >
      {button}
    </Tooltip>
  );

  return (
    <ModalWithForm
      title={EVENT_TRIGGERS_PANEL.ADD_MODAL.TITLE}
      modalOpeningComponent={modalOpeningComponent}
      confirmText={EVENT_TRIGGERS_PANEL.ADD_MODAL.CONFIRM_BUTTON.TEXT}
      invalidPopupMessage={
        EVENT_TRIGGERS_PANEL.ADD_MODAL.CONFIRM_BUTTON.INVALID_POPUP_MESSAGE
      }
      id="add-event-trigger-modal"
      className="fd-modal--xl-size"
      renderForm={props => (
        <CreateEventTriggerForm
          {...props}
          lambda={lambda}
          availableEvents={availableEvents}
        />
      )}
    />
  );
}

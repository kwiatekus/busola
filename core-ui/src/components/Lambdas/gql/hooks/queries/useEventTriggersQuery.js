import { useEffect } from 'react';
import { useNotification } from 'react-shared';
import { useQuery, useApolloClient } from '@apollo/react-hooks';

import { GET_EVENT_TRIGGERS } from 'components/Lambdas/gql/queries';
import { EVENT_TRIGGER_EVENT_SUBSCRIPTION } from 'components/Lambdas/gql/subscriptions';

import {
  useQueue,
  useStateWithCallback,
} from 'components/Lambdas/helpers/hooks';
import { formatMessage } from 'components/Lambdas/helpers/misc';
import { GQL_QUERIES } from 'components/Lambdas/constants';
import extractGraphQlErrors from 'shared/graphqlErrorExtractor';

export const useEventTriggersQuery = ({
  subscriber = null,
  lambda = {
    name: '',
    namespace: '',
  },
}) => {
  const notificationManager = useNotification();
  const [triggers, setTriggers] = useStateWithCallback([]);
  const apolloClient = useApolloClient();

  function processQueue(event, done) {
    const newTriggers = handleEvent(event, triggers);
    setTriggers(newTriggers, () => {
      done();
    });
  }
  const [addToQueue] = useQueue(processQueue);

  const variables = {
    namespace: lambda.namespace,
    subscriber,
  };

  const { data, error, loading } = useQuery(GET_EVENT_TRIGGERS, {
    variables,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (data && data.triggers && !triggers.length) {
      setTriggers(data.triggers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    const observer = apolloClient.subscribe({
      query: EVENT_TRIGGER_EVENT_SUBSCRIPTION,
      variables,
    });

    const subscription = observer.subscribe(({ data }) => {
      if (data && data.triggerEvent) {
        addToQueue(data.triggerEvent);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lambda.namespace, lambda.name]);

  useEffect(() => {
    if (error) {
      const errorToDisplay = extractGraphQlErrors(error);

      const message = formatMessage(GQL_QUERIES.EVENT_TRIGGERS.ERROR_MESSAGE, {
        lambdaName: lambda.name,
        error: errorToDisplay,
      });

      notificationManager.notifyError({
        content: message,
        autoClose: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return [triggers, error, loading];
};

const actions = {
  ADD: 'ADD',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
};

export function handleEvent({ type, trigger }, prevTriggers = []) {
  function onAdd() {
    if (!prevTriggers.find(t => t.name === trigger.name)) {
      return [...prevTriggers, trigger];
    }

    return prevTriggers;
  }

  function onUpdate() {
    const index = prevTriggers.findIndex(t => t.name === trigger.name);
    if (index === -1) {
      return [...prevTriggers, trigger];
    }

    const updatedTriggers = [...prevTriggers];
    updatedTriggers[index] = {
      ...trigger,
    };
    return updatedTriggers;
  }

  function onDelete() {
    return prevTriggers.filter(t => t.name !== trigger.name);
  }

  switch (type) {
    case actions.ADD:
      return onAdd();
    case actions.UPDATE:
      return onUpdate();
    case actions.DELETE:
      return onDelete();
    default:
      return prevTriggers;
  }
}

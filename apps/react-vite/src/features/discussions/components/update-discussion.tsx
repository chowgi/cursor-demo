import { Pen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormDrawer, Input, Select, Textarea } from '@/components/ui/form';
import { useNotifications } from '@/components/ui/notifications';
import { Authorization, ROLES } from '@/lib/authorization';

import { useDiscussion } from '../api/get-discussion';
import {
  updateDiscussionInputSchema,
  useUpdateDiscussion,
} from '../api/update-discussion';
import {
  DEFAULT_DISCUSSION_PRIORITY,
  DISCUSSION_PRIORITY_OPTIONS,
} from '../types/discussion-priority';

type UpdateDiscussionProps = {
  discussionId: string;
};

export const UpdateDiscussion = ({ discussionId }: UpdateDiscussionProps) => {
  const { addNotification } = useNotifications();
  const discussionQuery = useDiscussion({ discussionId });
  const updateDiscussionMutation = useUpdateDiscussion({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Discussion Updated',
        });
      },
    },
  });

  const discussion = discussionQuery.data?.data;

  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <FormDrawer
        isDone={updateDiscussionMutation.isSuccess}
        triggerButton={
          <Button icon={<Pen className="size-4" />} size="sm">
            Update Discussion
          </Button>
        }
        title="Update Discussion"
        submitButton={
          <Button
            form="update-discussion"
            type="submit"
            size="sm"
            isLoading={updateDiscussionMutation.isPending}
          >
            Submit
          </Button>
        }
      >
        <Form
          id="update-discussion"
          onSubmit={(values) => {
            updateDiscussionMutation.mutate({
              data: values,
              discussionId,
            });
          }}
          options={{
            defaultValues: {
              title: discussion?.title ?? '',
              body: discussion?.body ?? '',
              priority: discussion?.priority ?? DEFAULT_DISCUSSION_PRIORITY,
            },
          }}
          schema={updateDiscussionInputSchema}
        >
          {({ register, formState }) => (
            <>
              <Input
                label="Title"
                error={formState.errors['title']}
                registration={register('title')}
              />
              <Textarea
                label="Body"
                error={formState.errors['body']}
                registration={register('body')}
              />
              <Select
                label="Priority"
                error={formState.errors['priority']}
                options={DISCUSSION_PRIORITY_OPTIONS}
                defaultValue={
                  discussion?.priority ?? DEFAULT_DISCUSSION_PRIORITY
                }
                registration={register('priority')}
              />
            </>
          )}
        </Form>
      </FormDrawer>
    </Authorization>
  );
};

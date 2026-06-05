import {
  ArrowRight,
  MessageSquarePlus,
  MessagesSquare,
  UserCog,
  Users2,
} from 'lucide-react';
import { useMemo } from 'react';

import { ContentLayout } from '@/components/layouts';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Link } from '@/components/ui/link';
import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';
import { useDiscussions } from '@/features/discussions/api/get-discussions';
import { useTeams } from '@/features/teams/api/get-teams';
import { useUsers } from '@/features/users/api/get-users';
import { useUser } from '@/lib/auth';
import { Authorization, ROLES } from '@/lib/authorization';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/format';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const getInitials = (firstName: string, lastName: string) =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

type StatCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  isLoading?: boolean;
};

const StatCard = ({
  title,
  value,
  description,
  icon,
  isLoading,
}: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">
        {title}
      </CardTitle>
      <div className="rounded-lg bg-gray-100 p-2 text-gray-600">{icon}</div>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Spinner size="sm" />
      ) : (
        <>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-gray-500">{description}</p>
        </>
      )}
    </CardContent>
  </Card>
);

const DashboardRoute = () => {
  const user = useUser();
  const discussionsQuery = useDiscussions({});
  const teamsQuery = useTeams();
  const usersQuery = useUsers({
    queryConfig: {
      enabled: user.data?.role === ROLES.ADMIN,
    },
  });

  const teamName = useMemo(() => {
    if (!user.data?.teamId || !teamsQuery.data?.data) return 'Your team';
    const team = teamsQuery.data.data.find((t) => t.id === user.data?.teamId);
    return team?.name ?? 'Your team';
  }, [user.data?.teamId, teamsQuery.data?.data]);

  const recentDiscussions = useMemo(() => {
    if (!discussionsQuery.data?.data) return [];
    return [...discussionsQuery.data.data]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
  }, [discussionsQuery.data?.data]);

  const isLoadingStats =
    discussionsQuery.isLoading || teamsQuery.isLoading || usersQuery.isLoading;

  const firstName = user.data?.firstName ?? '';
  const lastName = user.data?.lastName ?? '';
  const role = user.data?.role;

  return (
    <ContentLayout title="Dashboard">
      <div className="space-y-6">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-md">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg font-semibold">
                {getInitials(firstName, lastName)}
              </div>
              <div>
                <p className="text-sm text-gray-300">{getGreeting()}</p>
                <h2 className="text-2xl font-bold">
                  {firstName} {lastName}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium">
                    {role}
                  </span>
                  <span className="text-sm text-gray-300">{teamName}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to={paths.app.discussions.getHref()}
                className={buttonVariants({ variant: 'secondary' })}
              >
                Browse discussions
              </Link>
              <Link
                to={paths.app.profile.getHref()}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'border-white/20 bg-white/10 text-white hover:bg-white/20',
                )}
              >
                View profile
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Discussions"
            value={discussionsQuery.data?.meta.total ?? 0}
            description="Total team discussions"
            icon={<MessagesSquare className="size-4" />}
            isLoading={isLoadingStats}
          />
          <StatCard
            title="Team"
            value={teamName}
            description="Your current workspace"
            icon={<Users2 className="size-4" />}
            isLoading={isLoadingStats}
          />
          <Authorization allowedRoles={[ROLES.ADMIN]}>
            <StatCard
              title="Members"
              value={usersQuery.data?.data.length ?? 0}
              description="Users in your team"
              icon={<UserCog className="size-4" />}
              isLoading={isLoadingStats}
            />
          </Authorization>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent discussions</CardTitle>
              <CardDescription>
                Latest conversations in your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              {discussionsQuery.isLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : recentDiscussions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 py-10 text-center">
                  <p className="text-sm text-gray-500">
                    No discussions yet. Start the first conversation!
                  </p>
                  <Link
                    to={paths.app.discussions.getHref()}
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'mt-4 inline-flex',
                    )}
                  >
                    Go to discussions
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {recentDiscussions.map((discussion) => (
                    <li key={discussion.id}>
                      <Link
                        to={paths.app.discussion.getHref(discussion.id)}
                        className="flex items-center justify-between gap-4 py-3 transition-colors hover:text-gray-900"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gray-900">
                            {discussion.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {discussion.author?.firstName}{' '}
                            {discussion.author?.lastName} &middot;{' '}
                            {formatDate(discussion.createdAt)}
                          </p>
                        </div>
                        <ArrowRight className="size-4 shrink-0 text-gray-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick actions</CardTitle>
                <CardDescription>Jump to common tasks</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Link
                  to={paths.app.discussions.getHref()}
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'justify-start',
                  )}
                >
                  <MessagesSquare className="mr-2 size-4" />
                  Browse discussions
                </Link>
                <Link
                  to={paths.app.profile.getHref()}
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'justify-start',
                  )}
                >
                  <Users2 className="mr-2 size-4" />
                  View profile
                </Link>
                <Authorization allowedRoles={[ROLES.ADMIN]}>
                  <Link
                    to={paths.app.discussions.getHref()}
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'justify-start',
                    )}
                  >
                    <MessageSquarePlus className="mr-2 size-4" />
                    Create discussion
                  </Link>
                  <Link
                    to={paths.app.users.getHref()}
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'justify-start',
                    )}
                  >
                    <UserCog className="mr-2 size-4" />
                    Manage users
                  </Link>
                </Authorization>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What you can do</CardTitle>
                <CardDescription>
                  Permissions for your {role?.toLowerCase()} role
                </CardDescription>
              </CardHeader>
              <CardContent>
                {role === ROLES.USER && (
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gray-400" />
                      Create comments in discussions
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gray-400" />
                      Delete own comments
                    </li>
                  </ul>
                )}
                {role === ROLES.ADMIN && (
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gray-400" />
                      Create discussions
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gray-400" />
                      Edit discussions
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gray-400" />
                      Delete discussions
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gray-400" />
                      Comment on discussions
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gray-400" />
                      Delete all comments
                    </li>
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};

export default DashboardRoute;

import Team from '@/models/team';
import User from '@/models/user';
import * as R from 'ramda';

type TeamHashType = { [key: string]: Team };

// Filters the teams by the user's membership status
// $FlowFixMe
export const getUsersTeams = (user: User, teams: TeamHashType): Array<Team> => {
    const userTeams = (user.teams as TeamHashType) || {};
    return R.compose(
        R.map(
            (key: string): Team =>
                Team.create({ ...userTeams[key], ...teams[key] })
        ),
        R.filter((key: string): boolean => Boolean(teams[key])),
        Object.keys
    )(userTeams);
};

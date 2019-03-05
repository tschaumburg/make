import * as log from '../makelog';

export const COMMAND_UNKNOWN_GOAL = 106;
export function commandUnknownGoal(goalName: string)
{
    var msg = "No rule to make target '" + goalName + "'";

    console.error(msg);
    log.fatal(msg);
    process.exit(COMMAND_UNKNOWN_GOAL);
}

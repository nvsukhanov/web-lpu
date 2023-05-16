import { TaskExecutor } from '../task-executor';
import { IHub, MotorUseProfile, PortCommandExecutionStatus } from '@nvsukhanov/poweredup-api';
import { PortCommandTask, PortCommandTaskType } from '../../../common';
import { Observable } from 'rxjs';

export class SetSpeedExecutor extends TaskExecutor {
    protected handle(
        task: PortCommandTask,
        hub: IHub
    ): Observable<PortCommandExecutionStatus> | null {
        if (task.taskType === PortCommandTaskType.SetSpeed) {
            return hub.commands.setSpeed(
                task.portId,
                task.speed,
                {
                    power: task.power,
                    useProfile: MotorUseProfile.dontUseProfiles
                }
            );
        }
        return null;
    }
}

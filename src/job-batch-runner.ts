import * as inquirer from 'inquirer';
import { JenkinsRxJs, JobDone, JobResponse } from 'jenkins-rxjs';
import { combineLatest, Observable } from 'rxjs';
import { last, takeUntil } from 'rxjs/operators';
import { JobBatchDescriptor, JobDescriptor } from './models';
import { processInterrupt$ } from './process-interrupt';
import { UiManager } from './ui-manager';

export class JobBatchRunner {
  constructor(private jenkins: JenkinsRxJs) {}

  async runBatches(jobBatchDescriptors: JobBatchDescriptor[]): Promise<void> {
    const uiManager = new UiManager(jobBatchDescriptors);

    for (const batchDescriptor of jobBatchDescriptors) {
      uiManager.printBatchHeader(batchDescriptor);

      const results: JobDone[] = await this.executeBatchJobs(
        batchDescriptor,
        uiManager,
      );

      uiManager.printBatchFooter(results);
      await this.ensureSuccess(
        results,
        uiManager,
        jobBatchDescriptors[jobBatchDescriptors.length - 1] === batchDescriptor,
      );
    }
  }

  private executeBatchJobs(
    batchDescriptor: JobBatchDescriptor,
    uiManager: UiManager,
  ): Promise<JobDone[]> {
    const streams: Observable<JobDone>[] = batchDescriptor.jobDescriptor.map(
      (jobDescriptor: JobDescriptor) => this.mapJob(jobDescriptor, uiManager),
    );

    return combineLatest(...streams)
      .pipe(last())
      .toPromise();
  }

  private mapJob(
    jobDescriptor: JobDescriptor,
    uiManager: UiManager,
  ): Observable<JobDone> {
    const stream$: Observable<JobResponse> = uiManager.createDisplayStream(
      jobDescriptor,
      this.jenkins.run(jobDescriptor.opts).pipe(takeUntil(processInterrupt$)),
    );

    return stream$.pipe(last()) as Observable<JobDone>;
  }

  private async ensureSuccess(
    results: JobDone[],
    uiManager: UiManager,
    isLast: boolean,
  ): Promise<void> {
    const failures: JobDone[] = results.filter(
      (result: JobDone) => result.status === 'FAILURE',
    );

    if (failures.length) {
      uiManager.printBatchError(failures);

      if (!isLast) {
        const question: inquirer.Question = {
          name: 'proceed',
          type: 'confirm',
          message: 'Do you want to continue anyway?',
          default: false,
        };

        const { proceed } = await inquirer.prompt<{ proceed: boolean }>([
          question,
        ]);

        !proceed && process.exit(1);
      }
    }
  }
}

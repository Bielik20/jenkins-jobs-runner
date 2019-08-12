import { JenkinsRxJs, JobDone, JobResponse } from 'jenkins-rxjs';
import { combineLatest, Observable } from 'rxjs';
import { last, takeUntil } from 'rxjs/operators';
import { JobBatchDescriptor, JobDescriptor } from './models';
import { processInterrupt$ } from './process-interrupt';
import { UiManager } from './ui-manager';

export class JobBatchRunner {
  constructor(private jenkins: JenkinsRxJs) {}

  async runBatches(jobBatchDescriptors: JobBatchDescriptor[]): Promise<void> {
    console.log('bielik 1');

    const uiManager = new UiManager(jobBatchDescriptors);

    console.log('bielik 2');

    for (const batchDescriptor of jobBatchDescriptors) {
      uiManager.printBatchHeader(batchDescriptor);

      console.log('bielik -loop 1');

      const results: JobDone[] = await this.executeBatchJobs(
        batchDescriptor,
        uiManager,
      );

      console.log('bielik -loop 2');

      uiManager.printBatchFooter(results);
      this.ensureSuccess(results, uiManager);
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

  private ensureSuccess(results: JobDone[], uiManager: UiManager): void {
    const failures: JobDone[] = results.filter(
      (result: JobDone) => result.status === 'FAILURE',
    );

    if (failures.length) {
      uiManager.printBatchError(failures);
      process.exit(1);
    }
  }
}

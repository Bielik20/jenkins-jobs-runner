<p align="center">
  <img src="https://user-images.githubusercontent.com/13436218/63001699-7c282400-be74-11e9-955b-0a3b78163ff8.png" width="500" alt="jenkins-jobs-runner">
</p>

# jenkins-jobs-runner

> A library for executing jenkins jobs in parallel in CLI

[![Build Status](https://travis-ci.org/Bielik20/jenkins-jobs-runner.svg?branch=master)](https://travis-ci.org/Bielik20/jenkins-jobs-runner)
[![NPM version](https://img.shields.io/npm/v/jenkins-jobs-runner.svg)](https://www.npmjs.com/package/jenkins-jobs-runner)
![Downloads](https://img.shields.io/npm/dm/jenkins-jobs-runner.svg)
[![Standard Version](https://img.shields.io/badge/release-standard%20version-brightgreen.svg)](https://github.com/conventional-changelog/standard-version)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

---

## ✨ Features

- executes sequentially n batches, each of n parallel jobs
- displays visual feedback in terminal

<p align="center">
  <img src="https://user-images.githubusercontent.com/13436218/63007567-2dcd5200-be81-11e9-8ae7-dbfef99a36d9.gif" width="800" alt="jenkins-jobs-runner-demo">
</p>

## 🔧 Installation

```sh
yarn add jenkins jenkins-rxjs jenkins-jobs-runner
```

## 🎬 Getting started

Let's demonstrate simple usage with an example:

Create an instance of Job Batch Runner:

```ts
import { JenkinsRxJs } from 'jenkins-rxjs';
import { JobBatchRunner} from 'jenkins-jobs-runner';

const jenkinsRxJs = new JenkinsRxJs(...);
const jobBatchRunner = new JobBatchRunner(jenkinsRxJs);
```

Prepare `JobBatchDescriptor` array:

```ts
const jobBatchDescriptors: JobBatchDescriptor[] = [
  {
    displayName: 'first group display name',
    jobDescriptor: [
      {
        displayName: 'first job of first group',
        opts: {
          name: 'jenkins-job-name',
          parameters: {
            firstParam: 'value-of-param'
          }
        },
      },
      {
        displayName: 'second one',
        opts: { ... },
      },
    ],
  },
  {
    displayName: 'second group',
    jobDescriptor: [
      {
        displayName: 'only job of a second group',
        opts: { ... },
      },
    ],
  },
];
```

Execute jobs:

```ts
jobBatchRunner.runBatches(builderResult).then(() => console.log('end'));
```

That is it. jobBatchRunner return a promise when finished should you want to do something afterward.

## 🎭 Examples

Go checkout [adeng-jenkins-cli](https://github.com/Bielik20/adeng-jenkins-cli) for examples of integration.

## 📜 API

Full API can be found [here](https://bielik20.github.io/jenkins-jobs-runner/).

### 🕵️ Troubleshooting

## 🥂 License

[MIT](./LICENSE.md) as always

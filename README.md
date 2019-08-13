# Google Cloud Build Bitbucket Integration

## Introduction

To begin create a cloud build configuration and a Pub/Sub configuration that is called `cloud-builds`

You will also need to create an App password with the permissions to (Read, Write & Admin) to the following scopes:
- Repository
- Pull Requests
- Pipelines
- Webhooks


## Environment Variables
You have to create a `.env.yml` file to deploy to prod with integraiton into BitBucket Cloud, the configuration required is 

```
BITBUCKET_USERNAME: <insert-user-name>
BITBUCKET_PASSWORD: <insert-app-password>
```

## Cloud Build Scripts

See [/cloud-build-script-examples](/cloud-build-script-examples) for sample cloud build scripts that work with NPM

# LICENSE
This repository is licensed under `MIT` see [LICENSE](./LICENSE) for more information
const axios = require("axios");

/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
exports.processPubSubMessage = (event, context) => {
  const pubsubMessage = event.data;
  const dataString = Buffer.from(pubsubMessage, "base64").toString();
  const message = JSON.parse(dataString);

  /*
    Sample Response from Pub/Sub
    {
      "projectId":"monash-student-booklist-dev",
      "repoName":"bitbucket_monash-university_monash-student-booklist",
      "commitSha":"475400eb2346736c8ec64cae4f774eaa819d651d"}
   */
  const commitSha = message.sourceProvenance.resolvedRepoSource.commitSha;
  const repoName = message.sourceProvenance.resolvedRepoSource.repoName;
  console.log(JSON.stringify(message.sourceProvenance.resolvedRepoSource));
  const [bitbucket, username, repo_slug] = repoName.split("_");

  const status = message.status.toLowerCase();

  // Build Bitbucket payload data.
  const payload = {
    type: "string",
    created_on: message.createTime,
    description: `Cloud Build Status: ${status.charAt(0).toUpperCase() +
      status.slice(1)}`,
    key: "string",
    name: "Google Cloud Build",
    refname: `buildTriggerId: ${message.buildTriggerId}`,
    state: getBitbucketState(message.status),
    updated_on: message.finishTime,
    url: message.logUrl,
    uuid: message.id
  };

  const bitbucket_username = process.env.BITBUCKET_USERNAME;
  const bitbucket_password = process.env.BITBUCKET_PASSWORD;

  const auth = Buffer.from(
    `${bitbucket_username}:${bitbucket_password}`
  ).toString("base64");

  // Send request to Bitbucket.
  const url = getBuildUrl(username, repo_slug, commitSha);
  axios
    .post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`
      }
    })
    .then(function(response) {
      console.log(JSON.stringify(response));
      return res.status(200).send(); // Response OK
    })
    .catch(function(error) {
      console.log(JSON.stringify(error));
    });

  /**
   * See: https://developer.atlassian.com/bitbucket/api/2/reference/resource/repositories/%7Busername%7D/%7Brepo_slug%7D/commit/%7Bnode%7D/statuses/build
   *
   * @param {string} owner
   * @param {string} repo_slug
   * @param {string} commitSha
   */
  function getBuildUrl(owner, repo_slug, commitSha) {
    // Change this if you want to report it elsewhere
    const baseUrl = "https://api.bitbucket.org/2.0/repositories";
    return `${baseUrl}/${owner}/${repo_slug}/commit/${commitSha}/statuses/build`;
  }

  /**
   * Translates states from Google Cloud Build Message to Bitbucket.
   * See: https://developer.atlassian.com/bitbucket/api/2/reference/resource/repositories/%7Busername%7D/%7Brepo_slug%7D/commit/%7Bnode%7D/statuses/build
   *
   * @param {string} status
   */
  function getBitbucketState(status) {
    switch (status.toLowerCase()) {
      case "success":
        return "SUCCESSFUL";
      case "queued":
      case "working":
        return "INPROGRESS";
      default:
        return "FAILED";
    }
  }
};

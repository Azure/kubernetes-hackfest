const { events, Job, Group } = require('brigadier')

events.on("push", (brigadeEvent, project) => {
    
    // setup variables
    var acrServer = project.secrets.acrServer
    var acrName = project.secrets.acrName
    var azServicePrincipal = project.secrets.azServicePrincipal
    var azClientSecret = project.secrets.azClientSecret
    var azTenant = project.secrets.azTenant
    var gitPayload = JSON.parse(brigadeEvent.payload)
    var today = new Date()
    var image = "chzbrgr71/api-location"
    var gitSHA = brigadeEvent.revision.commit.substr(0,7)
    var branch = getBranch(gitPayload)
    var imageTag = branch + "-" + gitSHA
    var acrImage = image + ":" + imageTag
    var imageFull = acrServer + "/" + image

    // setup container build brigade job
    var acr = new Job("job-runner-acr-builder")
    acr.storage.enabled = false
    acr.image = "microsoft/azure-cli:2.0.32"
    acr.tasks = [
        `cd /src/app/api-location`,
        `az login --service-principal -u ${azServicePrincipal} -p ${azClientSecret} --tenant ${azTenant}`,
        `az acr build --build-arg IMAGE_TAG_REF=${imageTag} -t ${acrImage} -r ${acrName} .`
    ]

    if (branch == "master") {
        console.log(`==> gitHub webook on master branch with commit ID ${gitSHA}`)
        
        // brigade job. Helm chart
        var helm = new Job("job-runner-helm")
        helm.storage.enabled = false
        helm.image = "chzbrgr71/k8s-helm:v2.9.1"
        helm.tasks = [
            `helm upgrade --install api-location ./src/charts/api-location --namespace quake --set location.image=${imageFull} --set location.imageTag=${imageTag} --set location.deployment=api-location --set location.versionLabel=prod`,
            `helm upgrade --install routes ./src/charts/routes --namespace quake --set prodWeight=99 --set canaryWeight=1`
        ]

        var pipeline = new Group()
        pipeline.add(acr)
        pipeline.add(helm)
        pipeline.runEach()

    } else if (branch == "dev") {
        console.log(`==> gitHub webook on dev branch with commit ID ${gitSHA}`)
        
        // brigade job. Helm chart
        var helm = new Job("job-runner-helm")
        helm.storage.enabled = false
        helm.image = "chzbrgr71/k8s-helm:v2.9.1"
        helm.tasks = [
            `helm upgrade --install api-location-canary ./src/charts/api-location --namespace quake --set location.image=${imageFull} --set location.imageTag=${imageTag} --set location.deployment=api-location-canary --set location.versionLabel=canary`,
            `helm upgrade --install routes ./src/charts/routes --namespace quake --set prodWeight=50 --set canaryWeight=50`
        ]

        var pipeline = new Group()
        pipeline.add(acr)
        pipeline.add(helm)
        pipeline.runEach()

    } else {
        console.log(`==> no action on (${branch}) with commit ID ${gitSHA}`)
    }

})

events.on("after", (event, proj) => {
    console.log("brigade pipeline finished successfully")

    var slack = new Job("slack-notify", "technosophos/slack-notify:latest", ["/slack-notify"])
    slack.storage.enabled = false
    slack.env = {
      SLACK_WEBHOOK: proj.secrets.slackWebhook,
      SLACK_USERNAME: "brigade",
      SLACK_MESSAGE: "brigade pipeline finished successfully",
      SLACK_COLOR: "#ff0000"
    }
	slack.run()
    
})

function getBranch (p) {
    if (p.ref) {
        return p.ref.substring(11)
    } else {
        return "PR"
    }
}

function slackJob (s, webhook, message) {
    s.storage.enabled = false
    s.env = {
      SLACK_WEBHOOK: webhook,
      SLACK_USERNAME: "brigade @ kubecon",
      SLACK_MESSAGE: message,
      SLACK_COLOR: "#0000ff"
    }
}
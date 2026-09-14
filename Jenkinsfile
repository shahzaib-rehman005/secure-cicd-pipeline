pipeline {
    agent any

    environment {
        IMAGE = "bunny324/secure-app"
        TAG = "${env.GIT_COMMIT.take(7)}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install & Test') {
            steps {
                sh 'npm install'
                sh 'npm test'
            }
        }

        stage('OWASP Dependency-Check') {
            steps {
                dependencyCheck additionalArguments: '--format XML --format HTML --scan .', odcInstallation: 'OWASP-DC'
                dependencyCheckPublisher pattern: 'dependency-check-report.xml'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh "sonar-scanner -Dsonar.projectKey=devops-project -Dsonar.sources=. -Dsonar.host.url=http://192.168.64.2:9000"
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh "docker build -t ${IMAGE}:${TAG} ."
            }
        }

        stage('Trivy Scan') {
            steps {
                sh "trivy image --severity HIGH,CRITICAL --exit-code 0 ${IMAGE}:${TAG}"
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh "echo $PASS | docker login -u $USER --password-stdin"
                    sh "docker push ${IMAGE}:${TAG}"
                }
            }
        }

        stage('Update Git Manifest (GitOps)') {
            steps {
                sh """
                    git fetch origin main
                    git checkout main
                    git reset --hard origin/main
                    sed -i '' "s|image: ${IMAGE}:.*|image: ${IMAGE}:${TAG}|" k8s/deployment.yaml
                    git config user.name "jenkins-bot"
                    git config user.email "jenkins-bot@example.com"
                    git commit -am "Update image to ${TAG} [skip ci]"
                    git push origin HEAD:main
                """
            }
        }
    }

    post {
        always {
            sh "docker logout || true"
        }
    }
}

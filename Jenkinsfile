
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        DOCKER_IMAGE_NAME = 'ravibhadarge/easyshop-app'
        DOCKER_MIGRATION_IMAGE_NAME = 'ravibhadarge/easyshop-migration'
        DOCKER_IMAGE_TAG = "${BUILD_NUMBER}"
        GIT_BRANCH = 'main'
    }

    stages {
        stage('Checkout Application') {
            steps {
                checkout scm
                sh '''
                    set -eu
                    echo "Branch: ${GIT_BRANCH}"
                    echo "Commit: $(git rev-parse --short HEAD)"
                    test -f Dockerfile
                    test -f scripts/Dockerfile.migration
                    test -d kubernetes
                    echo "Application files verified."
                '''
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Main App') {
                    steps {
                        sh '''
                            docker build \
                              -f Dockerfile \
                              -t ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} .
                        '''
                    }
                }

                stage('Build Migration') {
                    steps {
                        sh '''
                            docker build \
                              -f scripts/Dockerfile.migration \
                              -t ${DOCKER_MIGRATION_IMAGE_NAME}:${DOCKER_IMAGE_TAG} .
                        '''
                    }
                }
            }
        }

        stage('Security Scan with Trivy') {
            steps {
                sh '''
                    set -eu
                    trivy image --exit-code 1 --severity CRITICAL \
                      ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}

                    trivy image --exit-code 1 --severity CRITICAL \
                      ${DOCKER_MIGRATION_IMAGE_NAME}:${DOCKER_IMAGE_TAG}
                '''
            }
        }

        stage('Push Docker Images') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'docker-hub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
                        set +x
                        set -eu

                        echo "$DOCKER_PASSWORD" | docker login \
                          --username "$DOCKER_USER" --password-stdin

                        docker push ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}
                        docker push ${DOCKER_MIGRATION_IMAGE_NAME}:${DOCKER_IMAGE_TAG}

                        docker logout
                    '''
                }
            }
        }

        stage('Update Kubernetes Manifests') {
            steps {
                sh '''
                    set -eu

                    echo "Updating application image tags..."

                    find kubernetes -type f \\( -name '*.yaml' -o -name '*.yml' \\) \
                      -exec sed -i \
                      "s#image: *ravibhadarge/easyshop-app:[^[:space:]]*#image: ravibhadarge/easyshop-app:${DOCKER_IMAGE_TAG}#g" {} +

                    find kubernetes -type f \\( -name '*.yaml' -o -name '*.yml' \\) \
                      -exec sed -i \
                      "s#image: *ravibhadarge/easyshop-migration:[^[:space:]]*#image: ravibhadarge/easyshop-migration:${DOCKER_IMAGE_TAG}#g" {} +

                    echo "Updated image references:"
                    grep -Rn 'image:.*ravibhadarge/easyshop-' kubernetes || true
                '''

                script {
                    withCredentials([
                        gitUsernamePassword(
                            credentialsId: 'github-credentials',
                            gitToolName: 'Default'
                        )
                    ]) {
                        sh '''
                            set -eu

                            git config user.name "Jenkins CI"
                            git config user.email "jenkins@localhost"

                            if ! git diff --quiet -- kubernetes; then
                                git add kubernetes
                                git commit -m "ci: update EasyShop images [skip ci]"
                                git push origin HEAD:main
                            else
                                echo "No manifest changes to commit."
                            fi
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'EasyShop pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Check the first failed stage in the console log.'
        }
        always {
            echo 'Build finished.'
        }
    }
}

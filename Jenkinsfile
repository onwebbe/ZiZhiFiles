pipeline {
    agent {
        docker {
            image 'mhart/alpine-node:latest' 
            args '-p 3000:3000' 
        }
    }
    environment { 
        NODE_ENV = 'docker'
    }
    stages {
        stage('Build') { 
            steps {
                sh 'npm install --update-binary' 
            }
        }
        stage('Unit Test') { 
            steps {
                sh 'npm run unittest'
            }
        }
        stage('Integration Test') { 
            steps {
                sh 'docker run --rm -d -p 3406:3306 --name zizhifiles_test_mysql zizhifiles_test_mysql:1.0'
                sleep 8
                sh 'npm run integrationtest'
                sh 'docker container stop zizhifiles_test_mysql > /dev/null'
            }
        }
    }
    post {  
        always {  
            echo 'docker zizhifiles_test_mysql stopped'  
        }  
        success {  
            echo 'success'
            // mail bcc: '', body: "<b>Example</b><br>Project: ${env.JOB_NAME} <br>Build Number: ${env.BUILD_NUMBER} <br> URL de build: ${env.BUILD_URL}", cc: '', charset: 'UTF-8', from: '', mimeType: 'text/html', replyTo: '', subject: "ERROR CI: Project name -> ${env.JOB_NAME}", to: "onwebbe@163.com";  
        }  
        failure {
            echo 'failed'
            // emailext body: '<b>Build Failed</b><br>Project: ${env.JOB_NAME} <br>Build Number: ${env.BUILD_NUMBER} <br> URL de build: ${env.BUILD_URL}', recipientProviders: [[$class: 'DevelopersRecipientProvider'], [$class: 'RequesterRecipientProvider']], subject: 'Job Failed: Project name -> ${env.JOB_NAME}', to: 'onwebbe@163.com'
        }  
        unstable {  
            echo 'This will run only if the run was marked as unstable'  
        }  
        changed {  
            echo 'This will run only if the state of the Pipeline has changed'  
            echo 'For example, if the Pipeline was previously failing but is now successful'  
        }  
    }
}

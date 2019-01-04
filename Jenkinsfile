pipeline {
    agent {
        docker {
            image 'mhart/alpine-node:latest' 
            args '-p 3000:3000' 
        }
    }
    stages {
        stage('Build') { 
            steps {
                sh 'npm install --update-binary' 
            }
        }
        stage('Test') { 
            steps {
                sh 'npm test'
            }
        }
    }
}

pipeline {
  agent any

	options {
		disableConcurrentBuilds()
	}

  stages {
    stage('test') {
      steps {
        sh 'cd exchange; npm i; truffle test --compile-all'
      }
    }
  }
}

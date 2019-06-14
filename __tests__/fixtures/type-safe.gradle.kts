plugins {
  `java-library`
}

dependencies {
  api("junit:junit:4.12")
  implementation("junit:junit:4.12")
  testImplementation("junit:junit:4.12")
}

configurations {
  implementation {
    resolutionStrategy.failOnVersionConflict()
  }
}

sourceSets {
  main {                  
    java.srcDir("src/core/java")
  }
}

java {
  sourceCompatibility = JavaVersion.VERSION_11
  targetCompatibility = JavaVersion.VERSION_11
}

tasks {
  test {                  
    testLogging.showExceptions = true
  }
}
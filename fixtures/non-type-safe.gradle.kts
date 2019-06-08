apply(plugin = "java-library")

dependencies {
  "api"("junit:junit:4.12")
  "implementation"("junit:junit:4.12")
  "testImplementation"("junit:junit:4.12")
}

configurations {
  "implementation" {
    resolutionStrategy.failOnVersionConflict()
  }
}

configure<SourceSetContainer> {
  named("main") {
    java.srcDir("src/core/java")
  }
}

configure<JavaPluginConvention> {
  sourceCompatibility = JavaVersion.VERSION_11
  targetCompatibility = JavaVersion.VERSION_11
}

tasks {
  named<Test>("test") {
    testLogging.showExceptions = true
  }
}